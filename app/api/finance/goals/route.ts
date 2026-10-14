import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  try {
    const { data: goals, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, goals });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, target_amount, current_amount = 0, deadline, status = 'in_progress' } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'O nome da meta é obrigatório.' },
        { status: 400 }
      );
    }

    const targetNum = parseFloat(String(target_amount || 0));
    if (isNaN(targetNum) || targetNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'O valor alvo deve ser maior que zero.' },
        { status: 400 }
      );
    }

    const currentNum = parseFloat(String(current_amount || 0));

    const { data, error } = await supabaseAdmin
      .from('goals')
      .insert({
        user_id: DEFAULT_USER_ID,
        name: name.trim(),
        target_amount: targetNum,
        current_amount: isNaN(currentNum) ? 0 : Math.max(0, currentNum),
        deadline: deadline || null,
        status: status || 'in_progress',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, goal: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, target_amount, current_amount, deadline, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da meta é obrigatório.' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (target_amount !== undefined) {
      const val = parseFloat(String(target_amount));
      if (!isNaN(val) && val > 0) updates.target_amount = val;
    }
    if (current_amount !== undefined) {
      const val = parseFloat(String(current_amount));
      if (!isNaN(val) && val >= 0) updates.current_amount = val;
    }
    if (deadline !== undefined) updates.deadline = deadline || null;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabaseAdmin
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, goal: data });
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
        { success: false, error: 'ID da meta não informado.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('goals').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Meta removida com sucesso.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

