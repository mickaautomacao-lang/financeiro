const fs = require('fs');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MWEzODBhMy1hZDIzLTQ1M2EtYjA4Ny1kNjYxNmZiNzQwMTEiLCJpc3MiOiJuOG4iLCJqdGkiOiJjNmE3ZGY5My00Y2YyLTRhYTQtYjY5YS1jNGNlMzU3OTIzNjciLCJpYXQiOjE3OTE5NTA3MjUsImF1ZCI6InB1YmxpYy1hcGkifQ.e2NAtdV062FSc7iPsSvDD6_fxR2h0MQhqrRv-D-kOQc';
const baseUrl = 'https://n8n.srv1298454.hstgr.cloud/api/v1';
const workflowId = 'NFFCmBOwdA94HffT';

const workflow = {
  name: 'FinPulse - Gestão Financeira pelo Telegram',
  nodes: [
    {
      parameters: {
        updates: ['message']
      },
      id: 'telegram-trigger',
      name: 'Telegram Trigger',
      type: 'n8n-nodes-base.telegramTrigger',
      typeVersion: 1.1,
      position: [180, 400],
      webhookId: 'finpulse-telegram-webhook',
      credentials: {
        telegramApi: {
          id: 'EGG2HquTj1rPV9vq',
          name: 'Telegram - Conexao Cristo Vive'
        }
      }
    },
    {
      parameters: {
        jsCode: `
const msg = $input.first().json.message;
if (!msg || !msg.text) {
  return [{ json: { intent: 'ignore' } }];
}

const text = msg.text.trim();
const chatId = msg.chat.id;
const userName = msg.from ? (msg.from.first_name || msg.from.username || 'Usuário') : 'Usuário';
const textLower = text.toLowerCase();

// 1. Identificar intenções
if (textLower.startsWith('/start') || textLower.startsWith('/ajuda') || textLower === 'ajuda' || textLower === 'oi' || textLower === 'ola') {
  return [{ json: { intent: 'help', chatId, userName } }];
}

if (textLower.startsWith('/relatorio') || textLower.startsWith('/resumo') || textLower.startsWith('/saldo') || textLower === 'relatorio' || textLower === 'saldo') {
  return [{ json: { intent: 'report', chatId, userName } }];
}

if (textLower.startsWith('/vencimentos') || textLower.startsWith('/contas') || textLower.startsWith('/dividas') || textLower === 'contas') {
  return [{ json: { intent: 'debts', chatId, userName } }];
}

// 2. Tentar interpretar como despesa
// Exemplos aceitos:
// /gasto 45.90 Mercado
// /despesa 120 Combustivel Posto Shell
// 45,90 Almoco Restaurante
// Gasto: 50 Uber
const expensePattern = /^(?:\\/gasto|\\/despesa|gasto:?|despesa:?)?\\s*([R$]?\\s*\\d+(?:[.,]\\d{1,2})?)\\s*(.*)/i;
const match = text.match(expensePattern);

if (match && match[1]) {
  let rawValue = match[1].replace(/[R$\\s]/g, '').replace(',', '.');
  let amount = parseFloat(rawValue);
  let restText = (match[2] || '').trim();

  if (!isNaN(amount) && amount > 0) {
    let category = 'Geral';
    let description = restText || 'Despesa registrada via Telegram';

    const descLower = description.toLowerCase();
    if (descLower.includes('mercado') || descLower.includes('almoço') || descLower.includes('almoco') || descLower.includes('jantar') || descLower.includes('lanche') || descLower.includes('comida') || descLower.includes('restaurante') || descLower.includes('pizza') || descLower.includes('ifood')) {
      category = 'Alimentação & Mercado';
    } else if (descLower.includes('gasolina') || descLower.includes('combustivel') || descLower.includes('uber') || descLower.includes('estacionamento') || descLower.includes('posto') || descLower.includes('pedagio')) {
      category = 'Transporte & Carro';
    } else if (descLower.includes('aluguel') || descLower.includes('condominio') || descLower.includes('luz') || descLower.includes('agua') || descLower.includes('internet') || descLower.includes('enel') || descLower.includes('energia')) {
      category = 'Moradia & Contas';
    } else if (descLower.includes('farmacia') || descLower.includes('remedio') || descLower.includes('medico') || descLower.includes('consulta') || descLower.includes('dentista')) {
      category = 'Saúde & Farmácia';
    } else if (descLower.includes('cinema') || descLower.includes('netflix') || descLower.includes('spotify') || descLower.includes('show') || descLower.includes('jogo') || descLower.includes('livro')) {
      category = 'Lazer & Assinaturas';
    }

    return [{
      json: {
        intent: 'expense',
        chatId,
        userName,
        amount,
        description,
        category,
        date: new Date().toISOString().split('T')[0]
      }
    }];
  }
}

return [{ json: { intent: 'help', chatId, userName, notUnderstood: true } }];
`
      },
      id: 'parse-message-code',
      name: 'Classificar Mensagem',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [420, 400]
    },
    {
      parameters: {
        rules: {
          values: [
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '' },
                conditions: [
                  {
                    leftValue: '={{ $json.intent }}',
                    rightValue: 'expense',
                    operator: { type: 'string', operation: 'equals' }
                  }
                ],
                combinator: 'and'
              }
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '' },
                conditions: [
                  {
                    leftValue: '={{ $json.intent }}',
                    rightValue: 'report',
                    operator: { type: 'string', operation: 'equals' }
                  }
                ],
                combinator: 'and'
              }
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '' },
                conditions: [
                  {
                    leftValue: '={{ $json.intent }}',
                    rightValue: 'debts',
                    operator: { type: 'string', operation: 'equals' }
                  }
                ],
                combinator: 'and'
              }
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '' },
                conditions: [
                  {
                    leftValue: '={{ $json.intent }}',
                    rightValue: 'help',
                    operator: { type: 'string', operation: 'equals' }
                  }
                ],
                combinator: 'and'
              }
            }
          ]
        }
      },
      id: 'switch-intent',
      name: 'Roteador de Intenções',
      type: 'n8n-nodes-base.switch',
      typeVersion: 3.2,
      position: [680, 400]
    },
    {
      parameters: {
        method: 'POST',
        url: 'https://financeiro-nu-sage.vercel.app/api/sync/transactions',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'x-webhook-secret', value: 'finpulse-secret-key-2026' }
          ]
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ JSON.stringify({ user_id: "00000000-0000-0000-0000-000000000000", amount: $json.amount, type: "expense", category_name: $json.category, description: $json.description, payment_method: "Telegram", source: "telegram_bot", notify_telegram: false }) }}'
      },
      id: 'http-insert-expense',
      name: 'Salvar Despesa no Supabase',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [940, 220]
    },
    {
      parameters: {
        chatId: '={{ $("parse-message-code").first().json.chatId }}',
        text: '={{ "✅ <b>DESPESA REGISTRADA COM SUCESSO!</b>\\n\\n💵 <b>Valor:</b> R$ " + $("parse-message-code").first().json.amount.toFixed(2).replace(".", ",") + "\\n📁 <b>Categoria:</b> " + $("parse-message-code").first().json.category + "\\n📝 <b>Descrição:</b> " + $("parse-message-code").first().json.description + "\\n📅 <b>Data:</b> " + $("parse-message-code").first().json.date + "\\n\\n<i>Os dados já foram computados no Dashboard e Supabase!</i>" }}',
        additionalFields: {
          parse_mode: 'HTML'
        }
      },
      id: 'telegram-confirm-expense',
      name: 'Confirmar no Telegram',
      type: 'n8n-nodes-base.telegram',
      typeVersion: 1.2,
      position: [1200, 220],
      credentials: {
        telegramApi: {
          id: 'EGG2HquTj1rPV9vq',
          name: 'Telegram - Conexao Cristo Vive'
        }
      }
    },
    {
      parameters: {
        method: 'GET',
        url: 'https://yjzmheubgqhlmuprbabp.supabase.co/rest/v1/v_budget_vs_actual?select=*',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'apikey', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqem1oZXViZ3FobG11cHJiYWJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk0MTc1NSwiZXhwIjoyMTA3NTE3NzU1fQ.oZU5p3M1LF0JPffcMxPrMAuZXGhurSTbW-11XlRJD7k' },
            { name: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqem1oZXViZ3FobG11cHJiYWJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk0MTc1NSwiZXhwIjoyMTA3NTE3NzU1fQ.oZU5p3M1LF0JPffcMxPrMAuZXGhurSTbW-11XlRJD7k' }
          ]
        }
      },
      id: 'http-get-budgets',
      name: 'Buscar Orçamentos',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [940, 360]
    },
    {
      parameters: {
        method: 'GET',
        url: 'https://yjzmheubgqhlmuprbabp.supabase.co/rest/v1/transactions?select=amount,type,status&status=eq.completed',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'apikey', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqem1oZXViZ3FobG11cHJiYWJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk0MTc1NSwiZXhwIjoyMTA3NTE3NzU1fQ.oZU5p3M1LF0JPffcMxPrMAuZXGhurSTbW-11XlRJD7k' },
            { name: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqem1oZXViZ3FobG11cHJiYWJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk0MTc1NSwiZXhwIjoyMTA3NTE3NzU1fQ.oZU5p3M1LF0JPffcMxPrMAuZXGhurSTbW-11XlRJD7k' }
          ]
        }
      },
      id: 'http-get-transactions',
      name: 'Buscar Transações',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1140, 360]
    },
    {
      parameters: {
        jsCode: `
const chatId = $('parse-message-code').first().json.chatId;
const budgets = $('http-get-budgets').all().map(i => i.json);
const txs = $('http-get-transactions').all().map(i => i.json);

let totalIncome = 0;
let totalExpense = 0;

txs.forEach(t => {
  const val = parseFloat(t.amount) || 0;
  if (t.type === 'income') totalIncome += val;
  else if (t.type === 'expense') totalExpense += val;
});

const netBalance = totalIncome - totalExpense;

let budgetLines = '';
budgets.forEach(b => {
  const spent = parseFloat(b.actual_spent) || 0;
  const plan = parseFloat(b.planned_amount) || 0;
  const pct = parseFloat(b.percentage_used) || 0;
  const alert = pct >= 80 ? '⚠️' : '✅';
  budgetLines += alert + ' <b>' + b.category_name + ':</b> R$ ' + spent.toFixed(2).replace('.', ',') + ' de R$ ' + plan.toFixed(2).replace('.', ',') + ' (' + pct.toFixed(1) + '%)\\n';
});

const report = 
  '📊 <b>RELATÓRIO FINANCEIRO GERAL</b> 📊\\n\\n' +
  '🟢 <b>Total de Entradas:</b> R$ ' + totalIncome.toFixed(2).replace('.', ',') + '\\n' +
  '🔴 <b>Total de Despesas:</b> R$ ' + totalExpense.toFixed(2).replace('.', ',') + '\\n' +
  '📈 <b>Saldo Líquido:</b> R$ ' + netBalance.toFixed(2).replace('.', ',') + '\\n\\n' +
  '📁 <b>Orçamento Mensal (Planejado x Realizado):</b>\\n' +
  (budgetLines || '<i>Nenhuma categoria encontrada</i>') + '\\n' +
  '🌐 <i>Acesse o Dashboard: https://financeiro-nu-sage.vercel.app</i>';

return [{ json: { chatId, report } }];
`
      },
      id: 'code-format-report',
      name: 'Formatar Relatório Geral',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1340, 360]
    },
    {
      parameters: {
        chatId: '={{ $json.chatId }}',
        text: '={{ $json.report }}',
        additionalFields: {
          parse_mode: 'HTML'
        }
      },
      id: 'telegram-send-report',
      name: 'Enviar Relatório Telegram',
      type: 'n8n-nodes-base.telegram',
      typeVersion: 1.2,
      position: [1540, 360],
      credentials: {
        telegramApi: {
          id: 'EGG2HquTj1rPV9vq',
          name: 'Telegram - Conexao Cristo Vive'
        }
      }
    },
    {
      parameters: {
        method: 'GET',
        url: 'https://yjzmheubgqhlmuprbabp.supabase.co/rest/v1/debts?select=*&status=eq.active&order=due_date.asc',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'apikey', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqem1oZXViZ3FobG11cHJiYWJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk0MTc1NSwiZXhwIjoyMTA3NTE3NzU1fQ.oZU5p3M1LF0JPffcMxPrMAuZXGhurSTbW-11XlRJD7k' },
            { name: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqem1oZXViZ3FobG11cHJiYWJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk0MTc1NSwiZXhwIjoyMTA3NTE3NzU1fQ.oZU5p3M1LF0JPffcMxPrMAuZXGhurSTbW-11XlRJD7k' }
          ]
        }
      },
      id: 'http-get-debts',
      name: 'Buscar Dívidas e Contas',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [940, 500]
    },
    {
      parameters: {
        jsCode: `
const chatId = $('parse-message-code').first().json.chatId;
const debts = $input.all().map(i => i.json);

if (!debts || debts.length === 0) {
  return [{
    json: {
      chatId,
      message: '🎉 <b>Parabéns!</b> Nenhuma conta ou dívida ativa encontrada no momento.'
    }
  }];
}

const today = new Date();
today.setHours(0,0,0,0);

let lines = '';
let nearDueCount = 0;

debts.forEach(d => {
  const parts = d.due_date.split('-');
  const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const val = parseFloat(d.remaining_amount) || 0;
  const valFormatted = 'R$ ' + val.toFixed(2).replace('.', ',');
  const dateFormatted = parts[2] + '/' + parts[1] + '/' + parts[0];

  let urgency = '⚪';
  if (diffDays < 0) {
    urgency = '🔴 <b>VENCIDO (' + Math.abs(diffDays) + 'd atrás)</b>';
    nearDueCount++;
  } else if (diffDays <= 3) {
    urgency = '🚨 <b>VENCE EM ' + diffDays + ' DIA(S)!</b>';
    nearDueCount++;
  } else {
    urgency = '⏳ Vence em ' + diffDays + ' dias';
  }

  lines += '• <b>' + d.creditor + '</b>: ' + valFormatted + '\\n  ' + urgency + ' (' + dateFormatted + ')\\n\\n';
});

const message = 
  '⏰ <b>CONTROLE DE VENCIMENTOS & CONTAS</b> ⏰\\n\\n' +
  (nearDueCount > 0 ? '⚠️ <i>Atenção: Você tem ' + nearDueCount + ' conta(s) vencidas ou com vencimento em até 3 dias!</i>\\n\\n' : '') +
  lines +
  '💳 <i>Evite juros e multas realizando o pagamento antecipado.</i>';

return [{ json: { chatId, message } }];
`
      },
      id: 'code-format-debts',
      name: 'Formatar Avisos Vencimento',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1140, 500]
    },
    {
      parameters: {
        chatId: '={{ $json.chatId }}',
        text: '={{ $json.message }}',
        additionalFields: {
          parse_mode: 'HTML'
        }
      },
      id: 'telegram-send-debts',
      name: 'Enviar Vencimentos Telegram',
      type: 'n8n-nodes-base.telegram',
      typeVersion: 1.2,
      position: [1340, 500],
      credentials: {
        telegramApi: {
          id: 'EGG2HquTj1rPV9vq',
          name: 'Telegram - Conexao Cristo Vive'
        }
      }
    },
    {
      parameters: {
        chatId: '={{ $json.chatId }}',
        text: '={{ "👋 Olá, <b>" + $json.userName + "</b>!\\nSou seu <b>Assistente Financeiro FinPulse</b> ⚡\\n\\nComandos disponíveis:\\n\\n💸 <b>Registrar Despesa:</b>\\n• <code>/gasto 45.90 Mercado almoço</code>\\n• <code>/despesa 120 Gasolina Posto Shell</code>\\n• Ou envie direto: <code>35,00 Farmácia</code>\\n\\n📊 <b>Relatório Geral:</b>\\n• <code>/relatorio</code> ou <code>/saldo</code>\\n\\n⏰ <b>Avisos de Vencimento:</b>\\n• <code>/vencimentos</code> ou <code>/contas</code>\\n\\n🌐 <b>Dashboard Web:</b>\\nhttps://financeiro-nu-sage.vercel.app" }}',
        additionalFields: {
          parse_mode: 'HTML'
        }
      },
      id: 'telegram-send-help',
      name: 'Enviar Menu Ajuda',
      type: 'n8n-nodes-base.telegram',
      typeVersion: 1.2,
      position: [940, 660],
      credentials: {
        telegramApi: {
          id: 'EGG2HquTj1rPV9vq',
          name: 'Telegram - Conexao Cristo Vive'
        }
      }
    },
    {
      parameters: {
        rule: {
          interval: [
            {
              field: 'cronExpression',
              expression: '0 8 * * *'
            }
          ]
        }
      },
      id: 'cron-daily-8am',
      name: 'Cron Diário (08:00 AM)',
      type: 'n8n-nodes-base.cron',
      typeVersion: 1,
      position: [180, 840]
    },
    {
      parameters: {
        method: 'POST',
        url: 'https://financeiro-nu-sage.vercel.app/api/alerts/check',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Authorization', value: 'Bearer finpulse-cron-secret-2026' }
          ]
        }
      },
      id: 'http-cron-check-alerts',
      name: 'Disparar Rotina de Alertas',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [420, 840]
    }
  ],
  connections: {
    'Telegram Trigger': {
      main: [
        [
          {
            node: 'Classificar Mensagem',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Classificar Mensagem': {
      main: [
        [
          {
            node: 'Roteador de Intenções',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Roteador de Intenções': {
      main: [
        [
          {
            node: 'Salvar Despesa no Supabase',
            type: 'main',
            index: 0
          }
        ],
        [
          {
            node: 'Buscar Orçamentos',
            type: 'main',
            index: 0
          }
        ],
        [
          {
            node: 'Buscar Dívidas e Contas',
            type: 'main',
            index: 0
          }
        ],
        [
          {
            node: 'Enviar Menu Ajuda',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Salvar Despesa no Supabase': {
      main: [
        [
          {
            node: 'Confirmar no Telegram',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Buscar Orçamentos': {
      main: [
        [
          {
            node: 'Buscar Transações',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Buscar Transações': {
      main: [
        [
          {
            node: 'Formatar Relatório Geral',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Formatar Relatório Geral': {
      main: [
        [
          {
            node: 'Enviar Relatório Telegram',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Buscar Dívidas e Contas': {
      main: [
        [
          {
            node: 'Formatar Avisos Vencimento',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Formatar Avisos Vencimento': {
      main: [
        [
          {
            node: 'Enviar Vencimentos Telegram',
            type: 'main',
            index: 0
          }
        ]
      ]
    },
    'Cron Diário (08:00 AM)': {
      main: [
        [
          {
            node: 'Disparar Rotina de Alertas',
            type: 'main',
            index: 0
          }
        ]
      ]
    }
  },
  settings: {
    executionOrder: 'v1'
  }
};

fs.writeFileSync('n8n/workflow-telegram-full.json', JSON.stringify(workflow, null, 2));
console.log('Arquivo salvo com sucesso!');

// Fazer PUT no n8n
console.log('Enviando para n8n (' + workflowId + ')...');
fetch(baseUrl + '/workflows/' + workflowId, {
  method: 'PUT',
  headers: {
    'X-N8N-API-KEY': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(workflow)
})
.then(r => r.json())
.then(d => {
  if (d.error || d.message && !d.id) {
    console.error('Erro n8n:', d);
  } else {
    console.log('Workflow atualizado com sucesso no n8n! ID:', d.id, 'Nome:', d.name, 'Nós:', d.nodes.length);
  }
})
.catch(e => console.error('Exceção ao enviar para n8n:', e));
