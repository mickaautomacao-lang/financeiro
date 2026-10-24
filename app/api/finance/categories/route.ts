import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      budget_limit,
      color,
      icon,
      category_type,
      category_nature,
      due_day,
      closing_day,
      pix_key,
      payment_info,
      group_name,
    } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'O nome da categoria é obrigatório.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const budgetLimitNumber = parseFloat(String(budget_limit || 0));
    const dueDayNum = due_day !== undefined && due_day !== null && due_day !== '' ? parseInt(String(due_day)) : null;
    const closingDayNum = closing_day !== undefined && closing_day !== null && closing_day !== '' ? parseInt(String(closing_day)) : null;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        user_id: DEFAULT_USER_ID,
        name: trimmedName,
        budget_limit: isNaN(budgetLimitNumber) ? 0 : Math.max(0, budgetLimitNumber),
        color: color || '#A3E635',
        icon: icon || 'Tag',
        category_type: category_type || 'variable',
        category_nature: category_nature || 'expense',
        due_day: dueDayNum,
        closing_day: closingDayNum,
        pix_key: pix_key ? String(pix_key).trim() : null,
        payment_info: payment_info ? String(payment_info).trim() : null,
        group_name: group_name ? String(group_name).trim() : 'Outros',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Já existe uma categoria cadastrada com este nome.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      budget_limit,
      color,
      icon,
      category_type,
      category_nature,
      due_day,
      closing_day,
      pix_key,
      payment_info,
      group_name,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da categoria é obrigatório.' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (budget_limit !== undefined) {
      const val = parseFloat(String(budget_limit));
      updates.budget_limit = isNaN(val) ? 0 : Math.max(0, val);
    }
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (category_type !== undefined) updates.category_type = category_type;
    if (category_nature !== undefined) updates.category_nature = category_nature;
    if (due_day !== undefined) {
      updates.due_day = due_day ? parseInt(String(due_day)) : null;
    }
    if (closing_day !== undefined) {
      updates.closing_day = closing_day ? parseInt(String(closing_day)) : null;
    }
    if (pix_key !== undefined) {
      updates.pix_key = pix_key ? String(pix_key).trim() : null;
    }
    if (payment_info !== undefined) {
      updates.payment_info = payment_info ? String(payment_info).trim() : null;
    }
    if (group_name !== undefined) {
      updates.group_name = group_name ? String(group_name).trim() : 'Outros';
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data });
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
        { success: false, error: 'ID da categoria não informado.' },
        { status: 400 }
      );
    }

    // Opcional: desvincular ou verificar transações vinculadas
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Categoria removida com sucesso.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

