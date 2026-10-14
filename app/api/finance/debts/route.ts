import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  try {
    const { data: debts, error } = await supabaseAdmin
      .from('debts')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, debts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      creditor,
      total_amount,
      remaining_amount,
      interest_rate = 0,
      due_date,
      status = 'active',
    } = body;

    if (!creditor || typeof creditor !== 'string' || creditor.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'O nome do credor/instituição é obrigatório.' },
        { status: 400 }
      );
    }

    const totalNum = parseFloat(String(total_amount || 0));
    if (isNaN(totalNum) || totalNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'O valor total deve ser maior que zero.' },
        { status: 400 }
      );
    }

    const remNum =
      remaining_amount !== undefined
        ? parseFloat(String(remaining_amount))
        : totalNum;

    if (!due_date) {
      return NextResponse.json(
        { success: false, error: 'A data de vencimento é obrigatória.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('debts')
      .insert({
        user_id: DEFAULT_USER_ID,
        creditor: creditor.trim(),
        total_amount: totalNum,
        remaining_amount: isNaN(remNum) ? totalNum : Math.max(0, remNum),
        interest_rate: parseFloat(String(interest_rate || 0)) || 0,
        due_date,
        status: status || 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, debt: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, creditor, total_amount, remaining_amount, interest_rate, due_date, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da obrigação é obrigatório.' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (creditor !== undefined) updates.creditor = creditor.trim();
    if (total_amount !== undefined) {
      const val = parseFloat(String(total_amount));
      if (!isNaN(val) && val > 0) updates.total_amount = val;
    }
    if (remaining_amount !== undefined) {
      const val = parseFloat(String(remaining_amount));
      if (!isNaN(val) && val >= 0) updates.remaining_amount = val;
    }
    if (interest_rate !== undefined) updates.interest_rate = parseFloat(String(interest_rate)) || 0;
    if (due_date !== undefined) updates.due_date = due_date;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabaseAdmin
      .from('debts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, debt: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da obrigação não informado.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('debts').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Obrigação removida com sucesso.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

