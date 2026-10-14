import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, register_transaction = true } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da parcela é obrigatório.' },
        { status: 400 }
      );
    }

    // 1. Buscar a parcela atual
    const { data: inst, error: fetchErr } = await supabaseAdmin
      .from('category_installments')
      .select('*, category:categories(name)')
      .eq('id', id)
      .single();

    if (fetchErr || !inst) {
      return NextResponse.json(
        { success: false, error: 'Parcela não encontrada.' },
        { status: 404 }
      );
    }

    const paidInstallmentNumber = inst.current_installment;
    const isNowFinal = paidInstallmentNumber >= inst.total_installments;
    const nextInstallment = isNowFinal ? inst.total_installments : paidInstallmentNumber + 1;
    const newStatus = isNowFinal ? 'completed' : 'active';

    // 2. Atualizar a parcela (avançar para a próxima ou concluir)
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('category_installments')
      .update({
        current_installment: nextInstallment,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // 3. Registrar a transação correspondente no extrato
    if (register_transaction) {
      const catName = inst.category?.name || 'Cartão de Crédito';
      await supabaseAdmin.from('transactions').insert({
        user_id: DEFAULT_USER_ID,
        amount: parseFloat(String(inst.installment_amount)),
        type: 'expense',
        category_id: inst.category_id,
        description: `${inst.description} (${paidInstallmentNumber}/${inst.total_installments})`,
        payment_method: 'Cartão de Crédito',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        source: 'installment_auto',
      });
    }

    return NextResponse.json({
      success: true,
      installment: updated,
      paidNumber: paidInstallmentNumber,
      isCompleted: isNowFinal,
      message: isNowFinal
        ? `Parcela final ${paidInstallmentNumber}/${inst.total_installments} paga com sucesso! Compra quitada! 🎉`
        : `Parcela ${paidInstallmentNumber}/${inst.total_installments} paga! Próxima parcela: ${nextInstallment}/${inst.total_installments}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

