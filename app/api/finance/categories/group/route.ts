import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { old_group, new_group } = body;

    if (!old_group || typeof old_group !== 'string' || !old_group.trim()) {
      return NextResponse.json(
        { success: false, error: 'O nome atual da gaveta é obrigatório.' },
        { status: 400 }
      );
    }

    if (!new_group || typeof new_group !== 'string' || !new_group.trim()) {
      return NextResponse.json(
        { success: false, error: 'O novo nome da gaveta é obrigatório.' },
        { status: 400 }
      );
    }

    const trimmedOld = old_group.trim();
    const trimmedNew = new_group.trim();

    if (trimmedOld === trimmedNew) {
      return NextResponse.json({
        success: true,
        message: 'O nome da gaveta já é o mesmo.',
      });
    }

    // 1. Atualiza o group_name em todas as categorias pertencentes ao grupo antigo
    const { data: updatedCategories, error: catError } = await supabaseAdmin
      .from('categories')
      .update({
        group_name: trimmedNew,
        updated_at: new Date().toISOString(),
      })
      .eq('group_name', trimmedOld)
      .select();

    if (catError) {
      return NextResponse.json(
        { success: false, error: `Erro ao atualizar categorias: ${catError.message}` },
        { status: 500 }
      );
    }

    // 2. Atualiza o group_name em todas as transações que pertencem a esse grupo
    const { error: txError } = await supabaseAdmin
      .from('transactions')
      .update({
        group_name: trimmedNew,
        updated_at: new Date().toISOString(),
      })
      .eq('group_name', trimmedOld);

    if (txError) {
      console.warn('Aviso: Não foi possível atualizar group_name em transações:', txError.message);
    }

    return NextResponse.json({
      success: true,
      message: `Gaveta "${trimmedOld}" renomeada para "${trimmedNew}" com sucesso!`,
      affectedCategories: updatedCategories?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro interno ao renomear gaveta.' },
      { status: 500 }
    );
  }
}

