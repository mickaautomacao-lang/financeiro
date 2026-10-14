# MEMÓRIA DO PROJETO: FinPulse — Controle Financeiro Pessoal

> **Data de Atualização:** 14 de Outubro de 2026  
> **Status Atual:** Em Produção (Vercel) • Banco Supabase Conectado • Deploy 100% Ativo  
> **Ambiente de Desenvolvimento:** Next.js 15 (App Router), Supabase (PostgreSQL - Ref: `yjzmheubgqhlmuprbabp`), n8n, Telegram Bot API  
> **URL de Produção (Vercel):** `https://financeiro-nu-sage.vercel.app`  
> **URL do Supabase:** `https://yjzmheubgqhlmuprbabp.supabase.co`  
> **Repositório GitHub:** `https://github.com/mickaautomacao-lang/financeiro.git` (Branch: `main`)  

---

## 1. Visão Geral do Projeto

O **FinPulse** é um Sistema de Controle Financeiro Pessoal automatizado de alta performance, desenhado para rastrear cada centavo com precisão e oferecer uma visão contínua e sem atritos entre o **Planejado vs. Realizado**.

O sistema opera sobre uma arquitetura híbrida:
1. **Frontend Moderno:** Interface web dark mode com destaques em verde neon, visualizações gráficas e tabelas paginadas.
2. **Backend Serverless & PostgreSQL:** Banco de dados relacional com isolamento rigoroso via Row Level Security (RLS) no Supabase.
3. **Automações em Segundo Plano (n8n):** Orquestração de entrada de dados contínua a partir de planilhas (Google Sheets/Excel) e disparo proativo de alertas inteligentes no Telegram.

---

## 2. Stack Tecnológico Definido

| Camada | Tecnologia | Função no Sistema |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15 (App Router)** | Estrutura modular, Server Components e API Routes. |
| **Biblioteca de UI** | **React 19 & Tailwind CSS** | Estilização utilitária e responsiva com tema dark nativo. |
| **Design System** | **Shadcn UI (Customizado)** | Componentes atômicos com estados de foco, hover e acessibilidade. |
| **Ícones** | **Lucide Icons** | Iconografia consistente em toda a aplicação. |
| **Visualização de Dados** | **Recharts** | Gráficos de área (fluxo de caixa) e rosca (categorias). |
| **Hospedagem & Analytics**| **Vercel** (`@vercel/analytics`, `@vercel/speed-insights`) | Telemetria de performance, Core Web Vitals e hosting Serverless. |
| **Banco de Dados** | **Supabase (PostgreSQL)** | Persistência relacional, RLS multi-tenant, views analíticas. |
| **Orquestrador de Fluxos**| **n8n** | Webhooks para Google Planilhas e agendamento Cron de alertas. |
| **Notificações** | **Telegram Bot API** | Alertas formatados em HTML com emojis para decisões rápidas. |

---

## 3. Identidade Visual (Design System)

Baseado no modelo visual de alto contraste e foco analítico:
- **Fundo Base:** Grafite profundo (`#0D0E12` / `#13151D`).
- **Bordas & Divisórias:** Grafite sutil (`#1E2230`).
- **Acento Primário (Destaque):** Verde Neon / Limão (`#A3E635`), com estados de hover (`#BEF264`) e sombras difusas (`shadow-neon-sm` e `shadow-neon-md`).
- **Semântica Financeira:**
  - **Receitas:** Verde suave (`#4ADE80`) e fundo `rgba(74, 222, 128, 0.12)`.
  - **Despesas:** Vermelho suave (`#F87171`) e fundo `rgba(248, 113, 113, 0.12)`.
  - **Avisos / Alertas:** Âmbar (`#FBBF24`) e fundo `rgba(251, 191, 36, 0.12)`.

---

## 4. O Que Foi Desenvolvido (Histórico por Etapa)

### Etapa 1: Modelagem de Dados & Tipagem TypeScript
- **Script SQL idempotente** em `supabase/schema.sql`:
  - **Enums:** `transaction_type`, `transaction_status`, `goal_status`, `debt_status`.
  - **Tabelas Centrais:**
    - `categories`: Limite planejado mensal (`budget_limit`), nome, cor e ícone.
    - `transactions`: Quantia com precisão centavo a centavo (`NUMERIC(14,2)`), método de pagamento, status e origem (`source`).
    - `goals`: Nome, valor alvo (`target_amount`), saldo acumulado (`current_amount`) e prazo (`deadline`).
    - `debts`: Credor, valor total, saldo devedor (`remaining_amount`), taxa de juros e data de vencimento (`due_date`).
  - **Auditoria:** Função plpgsql e triggers automáticos para `updated_at`.
  - **Segurança (RLS):** Políticas de `SELECT`, `INSERT`, `UPDATE` e `DELETE` restritas a `auth.uid() = user_id`.
  - **View Analítica `v_budget_vs_actual`:** Cálculo dinâmico do total gasto no mês corrente versus limite da categoria, computando percentual e a flag booleana `alert_threshold_reached` ($\ge 80\%$).
- **Tipagens TypeScript** em `types/database.types.ts` compatíveis com o cliente Supabase e modelos de domínio para os componentes React.

### Etapa 2: Layout Principal do Frontend
- **Configuração de Estilo:** `tailwind.config.ts` e `app/globals.css` com scrollbars escuras e brilhos neon.
- **Componentes Shadcn UI:** `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `avatar.tsx`.
- **Sidebar de Navegação Fixa (`components/layout/Sidebar.tsx`):**
  - Brand FinPulse com logo neon.
  - Links de navegação com pills ativas.
  - Card de status em tempo real do motor de sincronização n8n (`ONLINE`).
  - Perfil de usuário no rodapé.
- **Header Superior (`components/layout/Header.tsx`):**
  - Busca rápida com atalho `⌘K`.
  - Seletor de período temporal ("Outubro 2026").
  - Gatilho manual para forçar sincronização.
  - Botão de ação primário destacado: `+ Nova Transação`.
- **Right Sidebar (`components/layout/RightSidebar.tsx`):**
  - Card de Patrimônio Líquido consolidado.
  - Central de Alertas Inteligentes vinculados ao Telegram.
  - Feed de atividades recentes em tempo real.
- **Container Unificado (`components/layout/DashboardLayout.tsx`):** Grid fluida com scroll independente.

### Etapa 3: Componentes Analíticos e Visuais do Dashboard
- **Cards de KPI (`components/dashboard/KPICards.tsx`):**
  - Receita Líquida, Total de Entradas, Despesas do Mês e Metas/Reserva com barra de progresso.
- **Gráfico de Fluxo de Caixa (`components/dashboard/CashFlowChart.tsx`):**
  - `AreaChart` em Recharts com gradientes neon e vermelho suave.
  - Filtros de período (30D, 90D, 12M) e Tooltip rico formatado em BRL.
- **Gráfico de Rosca (`components/dashboard/CategoryDonutChart.tsx`):**
  - Distribuição percentual de despesas por categoria com métrica central do total gasto.
- **Progresso de Orçamento (`components/dashboard/BudgetProgress.tsx`):**
  - Comparativo Planejado x Realizado.
  - Marcador visual e alerta quando atinge o limiar de 80% do orçamento.
- **Tabela de Transações (`components/dashboard/TransactionTable.tsx`):**
  - Ordenação por colunas (Data, Descrição, Valor).
  - Filtro por tipo (Todas, Entradas, Saídas) e busca textual instantânea.
  - Paginação com controles Anterior/Próxima.
- **Página Inicial (`app/page.tsx`):** Montagem harmônica e integrada de todos os blocos analíticos.

### Etapa 4: Arquitetura de Automação (n8n & Telegram)
- **Serviço do Telegram (`lib/telegram.ts`):**
  - Funções de despacho via HTTP POST para a Bot API do Telegram.
  - Templates em formato HTML para os alertas de orçamento (>80%), vencimento de dívidas (próximos 3 dias), conquista de metas e novas linhas da planilha.
- **Endpoint Webhook (`POST /api/sync/transactions`):**
  - Recebe dados do n8n/Google Planilhas.
  - Valida chave de segurança `x-webhook-secret`.
  - Normaliza quantias monetárias com vírgula ou ponto.
  - Localiza ou cria a categoria automaticamente.
  - Insere no Supabase e audita o limite orçamentário em tempo real.
- **Endpoint Cron (`POST /api/alerts/check`):**
  - Executado periodicamente pelo Cron do n8n.
  - Consulta o banco e dispara alertas de teto (>80%), dívidas em D+3 e metas atingidas.
- **Workflows n8n Exportáveis:**
  - `n8n/workflow-google-sheets-sync.json`: Trigger de nova linha na planilha $\rightarrow$ sanitização em JavaScript $\rightarrow$ POST na API.
  - `n8n/workflow-telegram-alerts.json`: Cron diário às 08:00 AM $\rightarrow$ verificação de alertas $\rightarrow$ ramificação condicional.
- **Variáveis de Ambiente (`.env.example`) & Documentação (`README.md`).**

---

## 5. Mapeamento da Estrutura de Arquivos

```
c:\Finanças\
├── .env.example                               # Modelo de variáveis de ambiente
├── package.json                               # Dependências Next.js, React, Tailwind, Recharts
├── tsconfig.json                              # Configurações do TypeScript e paths (@/*)
├── tailwind.config.ts                         # Configuração Tailwind com paleta Neon Lime
├── postcss.config.js                          # Configuração do PostCSS
├── README.md                                  # Guia de instalação e visão do projeto
├── app/
│   ├── globals.css                            # Estilos globais e efeitos glow neon
│   ├── layout.tsx                             # Layout raiz HTML/Body
│   ├── page.tsx                               # Dashboard principal montado
│   └── api/
│       ├── alerts/check/route.ts              # Endpoint de verificação periódica de alertas
│       └── sync/transactions/route.ts         # Endpoint de recebimento do Webhook da planilha
├── components/
│   ├── dashboard/
│   │   ├── BudgetProgress.tsx                 # Barra de progresso do orçamento (regra 80%)
│   │   ├── CashFlowChart.tsx                  # Gráfico de Área (Fluxo de Caixa)
│   │   ├── CategoryDonutChart.tsx             # Gráfico de Rosca de categorias
│   │   ├── KPICards.tsx                       # Cards de KPIs no topo
│   │   └── TransactionTable.tsx               # Tabela de transações com ordenação e paginação
│   ├── layout/
│   │   ├── DashboardLayout.tsx                # Estrutura unificada de layout
│   │   ├── Header.tsx                         # Header com busca e ações
│   │   ├── RightSidebar.tsx                   # Painel lateral de alertas e patrimônio
│   │   └── Sidebar.tsx                        # Sidebar de navegação fixa à esquerda
│   └── ui/
│       ├── avatar.tsx                         # Avatar com fallback neon
│       ├── badge.tsx                          # Badges estilizadas (neon, success, danger, warning)
│       ├── button.tsx                         # Botões com variantes neon, secondary e outline
│       ├── card.tsx                           # Cards Shadcn tema dark graphite
│       └── input.tsx                          # Inputs com foco verde neon
├── lib/
│   ├── supabase.ts                            # Inicialização Supabase Client e Admin
│   ├── telegram.ts                            # Despachante e templates da API do Telegram
│   └── utils.ts                               # Utilitários de classes (cn) e formatação BRL
├── memoria/
│   └── MEMORIA_DO_PROJETO.md                  # Este documento de memória persistente
├── n8n/
│   ├── workflow-google-sheets-sync.json       # JSON exportável do fluxo Google Sheets -> Supabase
│   └── workflow-telegram-alerts.json          # JSON exportável do fluxo Cron -> Telegram Alerts
├── supabase/
│   └── schema.sql                             # DDL completo do PostgreSQL com RLS e View
└── types/
    └── database.types.ts                      # Tipos gerados do Supabase e interfaces de domínio
```

---

## 6. Onde Paramos & Próximos Passos Recomendados

### Estado Atual:
- Toda a fundação arquitetural, visual, de banco de dados e de automação está **100% projetada, implementada e arquivada no código-fonte**.
- O projeto está pronto para receber as credenciais reais do Supabase e do Telegram para execução em ambiente de produção ou local.

### Próximos Passos Sugeridos para as Próximas Sessões:
1. **Instalação de Pacotes & Execução Local:**
   - Executar `npm install` no diretório raiz para baixar as dependências declaradas em `package.json`.
   - Executar `npm run dev` e validar o carregamento da interface no navegador em `http://localhost:3000`.
2. **Configuração do Supabase:**
   - Criar o projeto no Supabase e colar o script de [schema.sql](file:///c:/Finan%C3%A7as/supabase/schema.sql) no SQL Editor.
   - Preencher o `.env.local` com a URL e chaves reais (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. **Criação do Bot do Telegram:**
   - Criar o bot via `@BotFather`, obter o token e preencher `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.
4. **Importação dos Workflows no n8n:**
   - Carregar os arquivos [workflow-google-sheets-sync.json](file:///c:/Finan%C3%A7as/n8n/workflow-google-sheets-sync.json) e [workflow-telegram-alerts.json](file:///c:/Finan%C3%A7as/n8n/workflow-telegram-alerts.json) no seu servidor n8n.
5. **Modal / Formulário de Inserção Manual:**
   - Adicionar uma janela modal interativa (Dialog do Shadcn) ao clicar no botão `+ Nova Transação` do Header para permitir cadastro direto pela interface, além da planilha.

---

## 7. Aprendizados & Decisões Arquiteturais

> **Data:** 13/10/2026

- **View SQL para Alertas em Tempo Real:** Criar a view `v_budget_vs_actual` no PostgreSQL centralizou toda a regra de negócio do "Planejado x Realizado" no banco. Isso eliminou a necessidade de duplicar lógicas complexas de agregação tanto no frontend quanto nas automações do n8n.
- **Paleta Dark Graphite com Neon:** A combinação de superfícies em camadas (`#0D0E12` $\rightarrow$ `#13151D` $\rightarrow$ `#191C27`) com o neon `#A3E635` gerou alto contraste e máxima legibilidade contábil, sem poluição visual.
- **Tratamento de Payload Resiliente no n8n:** O endpoint `/api/sync/transactions` foi projetado para aceitar tanto vírgula quanto ponto nas quantias financeiras, e criar categorias automaticamente caso ainda não existam, tornando a digitação de planilhas à prova de falhas.

