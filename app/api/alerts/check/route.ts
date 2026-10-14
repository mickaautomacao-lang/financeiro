import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramMessage, TelegramTemplates } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    // Validação de autenticação do n8n Cron
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.N8N_WEBHOOK_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Não autorizado: Chave de cron/webhook inválida' },
        { status: 401 }
      );
    }

    const alertsTriggered = {
      budgetWarnings: 0,
      debtsDue: 0,
      goalsAchieved: 0,
    };

    // =========================================================================
    // 1. MONITORAMENTO DE ORÇAMENTO (CATEGORIAS > 80% NO MÊS ATUAL)
    // =========================================================================
    const { data: budgetAlerts, error: budgetError } = await supabaseAdmin
      .from('v_budget_vs_actual')
      .select('*')
      .eq('alert_threshold_reached', true);

    if (!budgetError && budgetAlerts && budgetAlerts.length > 0) {
      for (const cat of budgetAlerts) {
        await sendTelegramMessage(
          TelegramTemplates.budgetWarning({
            categoryName: cat.category_name,
            spent: cat.actual_spent,
            planned: cat.planned_amount,
            percentage: cat.percentage_used,
          })
        );
        alertsTriggered.budgetWarnings++;
      }
    }

    // =========================================================================
    // 2. MONITORAMENTO DE DÍVIDAS/CONTAS COM VENCIMENTO NOS PRÓXIMOS 3 DIAS
    // =========================================================================
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 3);

    const todayStr = today.toISOString().split('T')[0];
    const targetStr = targetDate.toISOString().split('T')[0];

    const { data: debtsDue, error: debtsError } = await supabaseAdmin
      .from('debts')
      .select('*')
      .eq('status', 'active')
      .gte('due_date', todayStr)
      .lte('due_date', targetStr)
      .order('due_date', { ascending: true });

    if (!debtsError && debtsDue && debtsDue.length > 0) {
      const formattedDebts = debtsDue.map((d) => ({
        creditor: d.creditor,
        remainingAmount: d.remaining_amount,
        dueDate: d.due_date,
        interestRate: d.interest_rate,
      }));

      await sendTelegramMessage(TelegramTemplates.debtDueReminder(formattedDebts));
      alertsTriggered.debtsDue = debtsDue.length;
    }

    // =========================================================================
    // 3. MONITORAMENTO DE METAS FINANCEIRAS ATINGIDAS
    // =========================================================================
    const { data: completedGoals, error: goalsError } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('status', 'in_progress');

    if (!goalsError && completedGoals) {
      for (const goal of completedGoals) {
        if (goal.current_amount >= goal.target_amount) {
          // Dispara celebração no Telegram
          await sendTelegramMessage(
            TelegramTemplates.goalAchieved({
              goalName: goal.name,
              targetAmount: goal.target_amount,
              currentAmount: goal.current_amount,
            })
          );

          // Atualiza status no banco para 'completed'
          await supabaseAdmin
            .from('goals')
            .update({ status: 'completed' })
            .eq('id', goal.id);

          alertsTriggered.goalsAchieved++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      alertsTriggered,
      details: {
        budgetAlertsFound: budgetAlerts?.length || 0,
        debtsDueFound: debtsDue?.length || 0,
        goalsAchievedFound: alertsTriggered.goalsAchieved,
      },
    });
  } catch (error) {
    console.error('[Alerts Check Exception]:', error);
    return NextResponse.json(
      { error: 'Erro ao executar verificação de alertas', details: (error as Error).message },
      { status: 500 }
    );
  }
}

