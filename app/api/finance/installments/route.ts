import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category_id = searchParams.get('category_id');

    let query = supabaseAdmin
      .from('category_installments')
      .select(`
        *,
        category:categories(name, color, icon)
      `)
      .order('created_at', { ascending: false });

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data: installments, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, installments: installments || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category_id,
      description,
      installment_amount,
      total_installments = 1,
      current_installment = 1,
      due_day = 10,
      start_date,
      purchase_date,
      notes,
    } = body;

    if (!category_id) {
      return NextResponse.json(
        { success: false, error: 'Categoria é obrigatória.' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Descrição da compra é obrigatória.' },
        { status: 400 }
      );
    }

    const amountNum = parseFloat(String(installment_amount).replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'O valor da parcela deve ser maior que zero.' },
        { status: 400 }
      );
    }

    const totalInst = parseInt(String(total_installments)) || 1;
    const currentInst = parseInt(String(current_installment)) || 1;
    const dueDayNum = parseInt(String(due_day)) || 10;
    const resolvedPurchaseDate = purchase_date || start_date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('category_installments')
      .insert({
        user_id: DEFAULT_USER_ID,
        category_id,
        description: description.trim(),
        installment_amount: amountNum,
        total_installments: Math.max(1, totalInst),
        current_installment: Math.max(1, Math.min(currentInst, totalInst)),
        due_day: Math.min(31, Math.max(1, dueDayNum)),
        start_date: start_date || resolvedPurchaseDate,
        purchase_date: resolvedPurchaseDate,
        status: currentInst >= totalInst ? 'completed' : 'active',
        notes: notes ? notes.trim() : null,
      })
      .select(`
        *,
        category:categories(name, color, icon)
      `)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, installment: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      description,
      installment_amount,
      total_installments,
      current_installment,
      due_day,
      start_date,
      purchase_date,
      status,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da parcela é obrigatório.' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (description !== undefined) updates.description = description.trim();
    if (installment_amount !== undefined) {
      const val = parseFloat(String(installment_amount).replace(',', '.'));
      if (!isNaN(val) && val > 0) updates.installment_amount = val;
    }
    if (total_installments !== undefined) {
      const val = parseInt(String(total_installments));
      if (!isNaN(val) && val >= 1) updates.total_installments = val;
    }
    if (current_installment !== undefined) {
      const val = parseInt(String(current_installment));
      if (!isNaN(val) && val >= 1) updates.current_installment = val;
    }
    if (due_day !== undefined) {
      const val = parseInt(String(due_day));
      if (!isNaN(val) && val >= 1 && val <= 31) updates.due_day = val;
    }
    if (start_date !== undefined) updates.start_date = start_date;
    if (purchase_date !== undefined) updates.purchase_date = purchase_date;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('category_installments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(name, color, icon)
      `)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, installment: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID não informado.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('category_installments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Compra/parcela excluída com sucesso.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

