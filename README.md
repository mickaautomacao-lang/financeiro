# FinPulse — Sistema de Controle Financeiro Pessoal Automatizado

Sistema de controle financeiro pessoal de alta precisão com rastreamento centavo a centavo, arquitetura multi-tenant com Row Level Security (RLS) no Supabase, interface moderna em Dark/Neon construída com Next.js (App Router), Tailwind CSS e Recharts, integrado com Google Planilhas e alertas em tempo real no Telegram orquestrados via n8n.

---

## 🚀 Arquitetura Geral

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI, Lucide Icons, Recharts.
- **Backend & Banco de Dados**: Supabase (PostgreSQL, Row Level Security, Enums, Views analíticas e Triggers).
- **Orquestração e Automação**: n8n (Google Sheets Trigger, Webhooks REST e Cron Jobs).
- **Notificações**: API do Telegram (mensagens HTML ricas com relatórios de orçamento, lembretes de dívidas e celebração de metas).

---

## 📂 Estrutura do Projeto

```
c:\Finanças\
├── app/
│   ├── api/
│   │   ├── alerts/check/route.ts      # Endpoint chamado pelo Cron do n8n para alertas
│   │   └── sync/transactions/route.ts # Webhook de inserção a partir de Google Sheets
│   ├── globals.css                    # Variáveis Dark Mode e estilos Neon
│   ├── layout.tsx                     # Root Layout do Next.js
│   └── page.tsx                       # Dashboard principal integrado
├── components/
│   ├── dashboard/
│   │   ├── BudgetProgress.tsx         # Barra de progresso Planejado x Realizado (regra 80%)
│   │   ├── CashFlowChart.tsx          # Gráfico de Área (Receitas x Despesas em Recharts)
│   │   ├── CategoryDonutChart.tsx     # Gráfico de Rosca de distribuição por categoria
│   │   ├── KPICards.tsx               # Cards de KPI no topo do dashboard
│   │   └── TransactionTable.tsx       # Tabela de transações com ordenação e paginação
│   ├── layout/
│   │   ├── DashboardLayout.tsx        # Container unificado do dashboard
│   │   ├── Header.tsx                 # Barra superior com busca, filtros e ações
│   │   ├── RightSidebar.tsx           # Barra lateral direita de alertas e atividades
│   │   └── Sidebar.tsx                # Barra lateral de navegação fixa
│   └── ui/                            # Componentes atômicos Shadcn UI (button, card, badge, etc.)
├── lib/
│   ├── supabase.ts                    # Clientes Supabase (Client e Admin com Service Role)
│   ├── telegram.ts                    # Serviço e templates HTML da Bot API do Telegram
│   └── utils.ts                       # Helpers cn, formatação BRL e datas pt-BR
├── n8n/
│   ├── workflow-google-sheets-sync.json # Template do workflow de sincronização
│   └── workflow-telegram-alerts.json    # Template do workflow de disparo diário de alertas
├── supabase/
│   └── schema.sql                     # Script SQL completo com tabelas, RLS e View analítica
├── types/
│   └── database.types.ts              # Tipagens TypeScript completas para o Supabase e domínio
├── .env.example                       # Modelo de variáveis de ambiente
├── package.json                       # Configuração de scripts e dependências
├── tailwind.config.ts                 # Paleta dark grafite e verde neon #A3E635
└── tsconfig.json                      # Configuração do TypeScript
```

---

## 🛠️ Passo a Passo de Configuração

### 1. Banco de Dados (Supabase)
1. Acesse o **SQL Editor** no console do Supabase.
2. Copie e execute o conteúdo de `supabase/schema.sql`.
3. As 4 tabelas centrais (`categories`, `transactions`, `goals`, `debts`), os triggers de `updated_at`, os índices analíticos, as políticas de RLS e a view `v_budget_vs_actual` serão criados automaticamente.

### 2. Variáveis de Ambiente
Copie `.env.example` para `.env.local` e configure:
```bash
cp .env.example .env.local
```

### 3. Executando o Frontend Next.js
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000`.

### 4. Importando os Workflows no n8n
1. No n8n, clique em **Add Workflow** -> **Import from File**.
2. Importe:
   - `n8n/workflow-google-sheets-sync.json` para escutar novas linhas do Google Sheets e alimentar o Supabase.
   - `n8n/workflow-telegram-alerts.json` para executar a rotina diária das 08:00 AM e notificar no Telegram.

