import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      type,
      description,
      category_id,
      category_name,
      date,
      payment_method,
      status = 'completed',
      entry_subtype = 'variable',
      installments_count = 1,
      installment_number = 1,
    } = body;

    if (!amount || !type || !description) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: amount, type, description' },
        { status: 400 }
      );
    }

    const numericAmount = parseFloat(String(amount).replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido. Deve ser maior que zero.' },
        { status: 400 }
      );
    }

    let finalCategoryId = category_id;

    // Se passou nome mas não id, resolve ou cria categoria
    if (!finalCategoryId && category_name) {
      const { data: existingCat } = await supabaseAdmin
        .from('categories')
        .select('id')
        .ilike('name', category_name.trim())
        .maybeSingle();

      if (existingCat) {
        finalCategoryId = existingCat.id;
      } else {
        const { data: newCat } = await supabaseAdmin
          .from('categories')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            name: category_name.trim(),
            budget_limit: 1000.0,
            category_nature: type === 'income' ? 'income' : 'expense',
            category_type: entry_subtype || 'variable',
          })
          .select('id')
          .single();

        if (newCat) finalCategoryId = newCat.id;
      }
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        amount: numericAmount,
        type,
        category_id: finalCategoryId || null,
        description: description.trim(),
        date: date || new Date().toISOString().split('T')[0],
        payment_method: payment_method || 'Pix',
        status,
        source: 'manual_web',
        entry_subtype: entry_subtype || 'variable',
        installments_count: parseInt(String(installments_count)) || 1,
        installment_number: parseInt(String(installment_number)) || 1,
      })
      .select(`
        *,
        category:categories(name, color, icon)
      `)
      .single();

    if (insertError) {
      console.error('[Transactions API Error]:', insertError);
      return NextResponse.json(
        { error: 'Erro ao cadastrar transação', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: inserted,
    });
  } catch (error) {
    console.error('[Transactions API Exception]:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar transação' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da transação não fornecido' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

