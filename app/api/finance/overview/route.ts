import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { KPISummary } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'current_month'; // e.g. '2026-10', 'current_month', 'all'

    // 1. Buscar Categorias
    const { data: categories = [] } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');

    // 2. Buscar Transações com Categoria
    const { data: rawTransactions = [], error: txError } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        category:categories(name, color, icon)
      `)
      .order('date', { ascending: false });

    if (txError) {
      console.error('[Finance API] Erro ao buscar transações:', txError);
    }

    // Filtrar por período se aplicável
    const transactions = (rawTransactions || []).filter((t: any) => {
      if (period === 'all') return true;
      if (period === 'current_month') {
        const now = new Date();
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return t.date.startsWith(currentYearMonth);
      }
      return t.date.startsWith(period);
    });

    // 3. Buscar Orçamento Planejado x Realizado
    const { data: rawBudgets } = await supabaseAdmin
      .from('v_budget_vs_actual')
      .select('*');
    const budgets = rawBudgets || [];

    // 4. Buscar Dívidas e Metas
    const { data: rawDebts } = await supabaseAdmin
      .from('debts')
      .select('*')
      .eq('status', 'active')
      .order('due_date', { ascending: true });
    const debts = rawDebts || [];

    const { data: rawGoals } = await supabaseAdmin
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    const goals = rawGoals || [];

    // 5. Cálculo dos KPIs
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((t: any) => {
      const val = parseFloat(t.amount) || 0;
      if (t.status === 'completed') {
        if (t.type === 'income') totalIncome += val;
        else if (t.type === 'expense') totalExpenses += val;
      }
    });

    const netRevenue = totalIncome - totalExpenses;
    const currentBalance = netRevenue; // Saldo em conta baseado no fluxo

    const totalInvestedOrGoals = goals.reduce(
      (acc: number, g: any) => acc + (parseFloat(g.current_amount) || 0),
      0
    );

    const pendingDebtsTotal = debts.reduce(
      (acc: number, d: any) => acc + (parseFloat(d.remaining_amount) || 0),
      0
    );

    // Progresso da Reserva de Emergência
    const emergencyGoal = goals.find((g: any) =>
      g.name.toLowerCase().includes('reserva')
    );
    const emergencyFundProgress =
      emergencyGoal && emergencyGoal.target_amount > 0
        ? Math.min(
            100,
            Math.round((emergencyGoal.current_amount / emergencyGoal.target_amount) * 100)
          )
        : 0;

    const kpi: KPISummary = {
      netRevenue,
      totalIncome,
      totalExpenses,
      currentBalance,
      emergencyFundProgress,
      totalInvestedOrGoals,
      pendingDebtsTotal,
    };

    // 6. Agregação Diária para o Gráfico de Fluxo de Caixa (CashFlowChart)
    const dailyMap: { [day: string]: { receitas: number; despesas: number } } = {};
    transactions.forEach((t: any) => {
      if (t.status !== 'completed') return;
      const parts = t.date.split('-');
      const dayLabel = `${parts[2]}/${parts[1]}`;
      if (!dailyMap[dayLabel]) {
        dailyMap[dayLabel] = { receitas: 0, despesas: 0 };
      }
      const val = parseFloat(t.amount) || 0;
      if (t.type === 'income') dailyMap[dayLabel].receitas += val;
      else if (t.type === 'expense') dailyMap[dayLabel].despesas += val;
    });

    const cashFlowData = Object.entries(dailyMap).map(([day, values]) => ({
      day,
      receitas: values.receitas,
      despesas: values.despesas,
    }));

    // 7. Agregação por Categoria para o Gráfico de Rosca (CategoryDonutChart)
    const categoryMap: { [cat: string]: { value: number; color: string } } = {};
    transactions.forEach((t: any) => {
      if (t.type !== 'expense' || t.status !== 'completed') return;
      const catName = t.category?.name || 'Geral';
      const catColor = t.category?.color || '#A3E635';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { value: 0, color: catColor };
      }
      categoryMap[catName].value += parseFloat(t.amount) || 0;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([name, item]) => ({
      name,
      value: item.value,
      color: item.color,
    }));

    // 8. Alertas em Tempo Real
    const alerts: Array<{
      type: 'warning' | 'danger' | 'success';
      title: string;
      description: string;
      badge: string;
      time: string;
    }> = [];

    // Alerta de categorias >80%
    budgets.forEach((b: any) => {
      if (b.alert_threshold_reached) {
        alerts.push({
          type: 'warning',
          title: 'Atenção ao Orçamento!',
          description: `Categoria ${b.category_name} atingiu ${b.percentage_used}% do limite planejado.`,
          badge: `R$ ${b.actual_spent} de R$ ${b.planned_amount}`,
          time: 'Limite 80%',
        });
      }
    });

    // Alerta de dívidas em D+3
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    debts.forEach((d: any) => {
      const parts = d.due_date.split('-');
      const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const diffDays = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 3) {
        alerts.push({
          type: 'danger',
          title: diffDays < 0 ? 'Conta Vencida!' : `Vencimento Próximo (${diffDays} dias)`,
          description: `${d.creditor} vence dia ${parts[2]}/${parts[1]}.`,
          badge: `R$ ${d.remaining_amount}`,
          time: diffDays < 0 ? 'Vencida' : 'D+3',
        });
      }
    });

    return NextResponse.json({
      success: true,
      period,
      kpi,
      transactions,
      categories,
      budgets,
      debts,
      goals,
      cashFlowData,
      categoryDistribution,
      alerts,
    });
  } catch (error) {
    console.error('[Finance API Exception]:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados do dashboard', details: (error as Error).message },
      { status: 500 }
    );
  }
}
