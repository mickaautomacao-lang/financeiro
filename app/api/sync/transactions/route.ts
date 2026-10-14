import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramMessage, TelegramTemplates } from '@/lib/telegram';
import type { TransactionType, TransactionStatus } from '@/types/database.types';

export interface SyncTransactionItem {
  user_id: string;
  amount: number | string;
  type: TransactionType;
  category_name?: string;
  date?: string;
  status?: TransactionStatus;
  description: string;
  payment_method?: string;
  source?: string;
  notify_telegram?: boolean;
}

export interface SyncTransactionPayload {
  transactions: SyncTransactionItem[] | SyncTransactionItem;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validação de Segurança do Webhook n8n
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (expectedSecret && webhookSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Não autorizado: Chave de webhook inválida' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawData = body.transactions || body;
    const items: SyncTransactionItem[] = Array.isArray(rawData) ? rawData : [rawData];

    if (!items.length) {
      return NextResponse.json(
        { error: 'Nenhuma transação recebida no payload' },
        { status: 400 }
      );
    }

    const insertedResults: unknown[] = [];

    // 2. Processamento de cada item sincronizado
    for (const item of items) {
      if (!item.user_id || !item.amount || !item.description) {
        continue;
      }

      const numericAmount =
        typeof item.amount === 'string'
          ? parseFloat(item.amount.replace(',', '.').replace(/[^\d.-]/g, ''))
          : item.amount;

      // Resolução ou criação automática de categoria
      let categoryId: string | null = null;
      if (item.category_name) {
        const { data: existingCat } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('user_id', item.user_id)
          .ilike('name', item.category_name.trim())
          .maybeSingle();

        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          const { data: newCat } = await supabaseAdmin
            .from('categories')
            .insert({
              user_id: item.user_id,
              name: item.category_name.trim(),
              budget_limit: 1000.0, // Limite inicial padrão
            })
            .select('id')
            .single();

          if (newCat) categoryId = newCat.id;
        }
      }

      // Inserção da Transação no Supabase
      const { data: insertedTx, error: insertError } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: item.user_id,
          amount: numericAmount,
          type: item.type || 'expense',
          category_id: categoryId,
          date: item.date || new Date().toISOString().split('T')[0],
          status: item.status || 'completed',
          description: item.description,
          payment_method: item.payment_method || 'Planilha',
          source: item.source || 'google_sheets',
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Sync API] Erro ao inserir transação:', insertError);
        continue;
      }

      insertedResults.push(insertedTx);

      // Notificação opcional de inserção via Telegram
      if (item.notify_telegram !== false) {
        await sendTelegramMessage(
          TelegramTemplates.sheetsSyncNotification({
            description: item.description,
            amount: numericAmount,
            type: item.type || 'expense',
            category: item.category_name || 'Geral',
          })
        );
      }

      // Verificação em tempo real do limite de 80% do orçamento se for despesa
      if (item.type === 'expense' && categoryId) {
        const { data: budgetData } = await supabaseAdmin
          .from('v_budget_vs_actual')
          .select('*')
          .eq('category_id', categoryId)
          .eq('user_id', item.user_id)
          .maybeSingle();

        if (budgetData && budgetData.alert_threshold_reached) {
          await sendTelegramMessage(
            TelegramTemplates.budgetWarning({
              categoryName: budgetData.category_name,
              spent: budgetData.actual_spent,
              planned: budgetData.planned_amount,
              percentage: budgetData.percentage_used,
            })
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: insertedResults.length,
      inserted: insertedResults,
    });
  } catch (error) {
    console.error('[Sync API Exception]:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar sincronização', details: (error as Error).message },
      { status: 500 }
    );
  }
}

