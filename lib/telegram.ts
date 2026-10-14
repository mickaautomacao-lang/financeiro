import { formatCurrency, formatDateBR } from './utils';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

/**
 * Dispara mensagem para o Telegram do usuário usando a API oficial de Bot
 */
export async function sendTelegramMessage(
  text: string,
  chatId: string = DEFAULT_CHAT_ID || '',
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<TelegramResponse> {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.warn('[Telegram] Token ou Chat ID não configurado.');
    return { ok: false, description: 'Credentials missing' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode,
          disable_web_page_preview: true,
        }),
      }
    );

    return (await response.json()) as TelegramResponse;
  } catch (error) {
    console.error('[Telegram] Erro de envio:', error);
    return { ok: false, description: (error as Error).message };
  }
}

/**
 * Templates formatados em HTML para alertas visuais ricos
 */
export const TelegramTemplates = {
  // 1. Alerta de Categoria acima de 80% do Orçamento
  budgetWarning: (data: {
    categoryName: string;
    spent: number;
    planned: number;
    percentage: number;
  }) => {
    return `
🚨 <b>ALERTA DE ORÇAMENTO ULTRA-PRECISO</b> 🚨

Atenção! Você ultrapassou <b>80%</b> do teto planejado na categoria:
📁 <b>${data.categoryName}</b>

💰 <b>Gasto Atual:</b> ${formatCurrency(data.spent)}
🎯 <b>Teto Mensal:</b> ${formatCurrency(data.planned)}
📊 <b>Uso do Limite:</b> <code>${data.percentage.toFixed(1)}%</code>
⚠️ <b>Disponível Restante:</b> ${formatCurrency(Math.max(0, data.planned - data.spent))}

<i>Recomendação: Modere os gastos nessa categoria até a virada do mês.</i>
    `.trim();
  },

  // 2. Alerta de Vencimento de Dívidas / Contas nos próximos 3 dias
  debtDueReminder: (debts: Array<{
    creditor: string;
    remainingAmount: number;
    dueDate: string;
    interestRate: number;
  }>) => {
    const list = debts
      .map(
        (d) =>
          `• <b>${d.creditor}</b>: ${formatCurrency(d.remainingAmount)} (Vence em <code>${formatDateBR(d.dueDate)}</code>)`
      )
      .join('\n');

    return `
⏰ <b>LEMBRETE DE VENCIMENTO (PRÓXIMOS 3 DIAS)</b> ⏰

Você possui compromissos financeiros próximos da data de vencimento:

${list}

💳 <i>Evite juros e multas efetuando o pagamento ou agendando a liquidação no banco.</i>
    `.trim();
  },

  // 3. Alerta de Meta Financeira Atingida
  goalAchieved: (data: {
    goalName: string;
    targetAmount: number;
    currentAmount: number;
  }) => {
    return `
🎉 <b>PARABÉNS! META FINANCEIRA CONCLUÍDA!</b> 🎉

Você acabou de atingir a sua meta:
🏆 <b>${data.goalName}</b>

💰 <b>Valor Acumulado:</b> ${formatCurrency(data.currentAmount)}
🎯 <b>Alvo Planejado:</b> ${formatCurrency(data.targetAmount)}
🚀 <b>Progresso:</b> <code>100%</code>

<i>Seu esforço e disciplina estão transformando sua liberdade financeira!</i>
    `.trim();
  },

  // 4. Notificação de Nova Linha Sincronizada via Planilha
  sheetsSyncNotification: (data: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
  }) => {
    const symbol = data.type === 'income' ? '🟢 (+)' : '🔴 (-)';
    return `
⚡ <b>NOVA TRANSAÇÃO SINCRONIZADA</b> ⚡

${symbol} <b>${data.description}</b>
💵 <b>Valor:</b> ${formatCurrency(data.amount)}
🏷️ <b>Categoria:</b> ${data.category}
🔗 <b>Origem:</b> Google Planilhas / n8n Webhook
    `.trim();
  },
};

