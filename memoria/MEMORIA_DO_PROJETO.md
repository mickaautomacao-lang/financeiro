# MEMÓRIA DO PROJETO: FinPulse — Controle Financeiro Pessoal

> **Data de Atualização:** 14 de Outubro de 2026  
> **Status Atual:** 🚀 Em Produção (Vercel) • Banco Supabase Conectado • Bot Telegram @dashfina_bot 100% Operacional • Dashboard 100% Responsivo e Interativo  
> **Ambiente de Desenvolvimento:** Next.js 15 (App Router), React 19, Supabase (PostgreSQL - Ref: `yjzmheubgqhlmuprbabp`), n8n, Telegram Bot API  
> **URL de Produção (Vercel):** [https://financeiro-nu-sage.vercel.app](https://financeiro-nu-sage.vercel.app)  
> **Repositório GitHub:** [https://github.com/mickaautomacao-lang/financeiro.git](https://github.com/mickaautomacao-lang/financeiro.git) (Branch: `main`)  
> **Bot do Telegram Oficial:** [@dashfina_bot](https://t.me/dashfina_bot)  
> **Workflow Ativo no n8n:** `https://n8n.srv1298454.hstgr.cloud/workflow/NFFCmBOwdA94HffT`  
> **Instância Supabase:** `https://yjzmheubgqhlmuprbabp.supabase.co`  

---

## 1. Visão Geral do Projeto

O **FinPulse** é um ecossistema completo de gestão financeira pessoal e empresarial de alta performance. O sistema opera de forma integrada entre uma interface Web moderna e um Assistente no Telegram orquestrado pelo n8n, sincronizando transações, orçamentos e obrigações em tempo real com o banco de dados Supabase PostgreSQL.

---

## 2. Arquitetura do Sistema & Stack Tecnológico

| Camada | Tecnologia | Função no Sistema |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15 (App Router)** | Rotas modulares, Server Components, API Routes dinâmicas. |
| **Biblioteca de UI** | **React 19 & Tailwind CSS** | Tema dark nativo (`#0D0E12`), acentos Neon Lime (`#A3E635`) e layout 100% responsivo. |
| **Design System** | **Shadcn UI (Customizado)** | Modais, botões, badges semânticas, inputs monetários e drawer mobile. |
| **Visualização de Dados** | **Recharts** | Gráfico de área (fluxo de caixa) e rosca (categorias) com `ResponsiveContainer`. |
| **Hospedagem & CI/CD** | **Vercel** | Build e deploy automatizados acoplados ao branch `main` do GitHub. |
| **Banco de Dados** | **Supabase (PostgreSQL)** | RLS, constraints flexibilizadas para bots, view `v_budget_vs_actual`. |
| **Orquestrador de Fluxos**| **n8n** | Webhook do Telegram, classificador de intenções em JS, Cron diário às 08:00 AM. |
| **Notificações & Chatbot**| **Telegram Bot API** | Bot `@dashfina_bot` para cadastro de despesas, relatórios e avisos de vencimento. |

---

## 3. Comandos Oficiais do Bot no Telegram (@dashfina_bot)

### Inserção de Despesas com Categorização Inteligente
- `/gasto 45.90 Almoço no restaurante`
- `/despesa 120 Gasolina Posto Shell`
- Formato rápido sem comando: `35,00 Farmácia remédio`, `150 Conta de luz`, `25 Uber trabalho`
- **Classificação Automática:** Reconhece palavras-chave (*almoço, mercado, gasolina, uber, farmácia, aluguel, cinema, etc.*) e vincula à categoria e cor correspondente no Supabase.

### Consulta e Relatórios
- `/relatorio` ou `/saldo` ou `/resumo`: Emite o balanço consolidado de entradas, saídas, saldo líquido e acompanhamento dos limites orçamentários (regra 80%).
- `/vencimentos` ou `/contas` ou `/dividas`: Lista dívidas e parcelas pendentes com indicador de urgência (🚨 vence em até 3 dias, 🔴 atrasado, ⏳ a vencer).
- `/ajuda` ou `/start`: Exibe o menu interativo com instruções.

---

## 4. O Que Foi Desenvolvido (Histórico Detalhado)

### Etapa 1: Backend & Banco Supabase
- Execução do DDL relacional em `supabase/schema.sql` (`categories`, `transactions`, `goals`, `debts`).
- Criação da view analítica `v_budget_vs_actual` para auditoria do limite orçamentário.
- Flexibilização das restrições de Foreign Key para `auth.users(id)` garantindo compatibilidade com inserções anônimas do bot e da interface local.
- Seed inicial de 8 categorias padrão com limites orçamentários configurados.

### Etapa 2: APIs REST Internas no Next.js
- `GET /api/finance/overview`: Agregação completa de KPIs, transações, categorias, orçamentos, metas e alertas.
- `POST / PUT / DELETE /api/finance/transactions`: Registro e exclusão de movimentações financeiras.
- `GET / POST / PUT / DELETE /api/finance/categories`: Criação e edição de limites mensais de categorias.
- `GET / POST / PUT / DELETE /api/finance/goals`: Gestão de metas financeiras e reserva de emergência.
- `GET / POST / PUT / DELETE /api/finance/debts`: Cadastro de obrigações com juros e controle de vencimento.
- `POST /api/sync/transactions`: Webhook de sincronização segura com n8n (`x-webhook-secret`).
- `POST /api/alerts/check`: Endpoint executado pelo cron diário para auditar limites e vencimentos.

### Etapa 3: Interface Web, Modais & Gestão Dinâmica
- **Estado Global (`context/FinanceContext.tsx`):** Gerenciamento centralizado de transações, orçamentos, metas, alertas, filtro de período e menu mobile.
- **Modal de Nova Transação (`NewTransactionModal.tsx`):** Lançamento de receitas e despesas com validação e atualização instantânea dos gráficos.
- **Gestão de Categorias & Orçamentos (`/budgets` e `CategoryModal.tsx`):** Interface visual para criar e editar tetos de gastos, escolher ícones e cores da paleta neon.
- **Gestão de Metas & Reservas (`/goals` e `GoalModal.tsx`):** Acompanhamento de progresso de reserva de emergência e objetivos com suporte a aportes progressivos.
- **Gestão de Dívidas (`/debts` e `DebtModal.tsx`):** Acompanhamento de parcelas com cálculo automático de proximidade de vencimento.

### Etapa 5: Categorias Fixas vs. Cartão de Crédito e Controle de Sub-Parcelas
- **Distinção Tipológica de Categorias:**
  - `fixed` (Custos Fixos Recorrentes: Escola, Casa/Água/Luz, Internet Tim) — possui **Dia do Vencimento Mensal** configurável.
  - `credit_card` (Cartões de Crédito e Parcelados: Jarbas, Cartão Vadir, Moto Edison, Romario) — possui **Dia de Fechamento / Melhor Dia de Compra** e **Dia de Vencimento da Fatura**.
  - `variable` (Despesas variáveis do dia a dia: Mercado, Transporte, Lazer).
- **Tabela Relacional `category_installments`:**
  - Armazena compras parceladas vinculadas a uma categoria (`category_id`).
  - Campos: `description`, `installment_amount`, `total_installments`, `current_installment`, `due_day`, `start_date`, `purchase_date`, `status` (`active`, `completed`).
- **Múltiplas Compras na Mesma Categoria (Exemplo Real: Jarbas):**
  - Permite acumular compras na mesma fatura/pessoa (ex: R$ 500 em 6x + R$ 300 em 3x = R$ 800/mês).
  - Motor de inteligência que detecta qual compra encerra primeiro, emitindo aviso de alívio financeiro (ex: R$ 300 encerra em 3 meses, reduzindo o compromisso mensal para R$ 500/mês).
  - Matriz de projeção de desembolso mensal passo a passo (step-down timeline).
- **Abatimento e Quitação em 1 Clique:**
  - Endpoint `POST /api/finance/installments/pay` avança a parcela, marca como concluída quando atinge o total e registra a saída automaticamente no extrato contábil.
- **Interface e Navegação:**
  - Modal dedicado `CategoryInstallmentsModal.tsx` com visualização de compras ativas (mostrando data da compra e vencimento), histórico de quitadas e formulário com seleção de data de compra e vencimento.
  - Abas de filtro na página `/budgets` (Todas, Cartão / Parcelas, Fixas, Variáveis) exibindo data de fechamento e vencimento diretamente nos cards.
  - Botão rápido de parcelas na barra `BudgetProgress.tsx`.

---

## 5. Estrutura de Arquivos do Projeto

```
c:\Finanças\
├── app/
│   ├── api/finance/
│   │   ├── categories/route.ts        # CRUD de Categorias, Limites e Tipos (fixed/credit_card/variable)
│   │   ├── debts/route.ts             # CRUD de Dívidas & Obrigações
│   │   ├── goals/route.ts             # CRUD de Metas & Reserva
│   │   ├── installments/route.ts      # CRUD de Compras Parceladas por Categoria
│   │   ├── installments/pay/route.ts  # Abate rápido de parcela com lançamento no extrato
│   │   ├── overview/route.ts          # Agregação geral do Dashboard
│   │   └── transactions/route.ts      # Registro e exclusão de transações
│   ├── api/sync/transactions/route.ts # Webhook n8n
│   ├── api/alerts/check/route.ts      # Verificação periódica cron
│   ├── analytics/page.tsx             # Indicadores avançados
│   ├── budgets/page.tsx               # Orçamentos, abas por tipo e gestão de categorias/parcelas
│   ├── debts/page.tsx                 # Dívidas e faturas com alertas
│   ├── goals/page.tsx                 # Metas financeiras e reserva
│   ├── settings/page.tsx              # Configurações de conexões e bot
│   ├── transactions/page.tsx          # Extrato detalhado com exportação CSV
│   └── page.tsx                       # Dashboard principal
├── components/
│   ├── dashboard/
│   │   ├── BudgetProgress.tsx         # Barra de progresso da regra de 80% e botão de parcelas
│   │   ├── CashFlowChart.tsx          # Gráfico de Área (Fluxo de Caixa)
│   │   ├── CategoryDonutChart.tsx     # Gráfico de Rosca de Despesas
│   │   ├── CategoryInstallmentsModal.tsx # Modal de compras parceladas, projeção e alívio
│   │   ├── CategoryModal.tsx          # Modal de criação/edição com seletor de tipo de categoria
│   │   ├── DebtModal.tsx              # Modal de dívidas e obrigações
│   │   ├── GoalModal.tsx              # Modal de metas e reserva
│   │   ├── KPICards.tsx               # Indicadores de precisão contábil
│   │   ├── NewTransactionModal.tsx    # Modal de nova transação
│   │   └── TransactionTable.tsx       # Tabela de lançamentos responsiva
│   ├── layout/
│   │   ├── DashboardLayout.tsx        # Layout mestre com provider e modais centralizados
│   │   ├── Header.tsx                 # Header com busca, período e hamburger
│   │   ├── RightSidebar.tsx           # Painel lateral de patrimônio e alertas
│   │   └── Sidebar.tsx                # Menu lateral com suporte a drawer mobile
│   └── ui/                            # Componentes atômicos Shadcn UI
├── context/
│   └── FinanceContext.tsx             # Provider React com estado global unificado e suporte a parcelas
├── lib/
│   ├── supabase.ts                    # Clientes anon e service_role
│   ├── telegram.ts                    # Utilitário de disparo de mensagens
│   └── utils.ts                       # Formatadores BRL e classes
├── memoria/
│   └── MEMORIA_DO_PROJETO.md          # Memória central e histórico de decisões
└── supabase/
    └── schema.sql                     # Modelagem PostgreSQL completa
```

---

## 6. Aprendizados & Decisões Arquiteturais

> **Data:** 14/10/2026

- **Isolamento de Segredos no Git:** Chaves `service_role` e tokens pessoais de acesso jamais devem constar em arquivos rastreados pelo Git para não violar as proteções do GitHub Push Protection. Arquivos auxiliares locais como scripts de migração foram movidos para `.gitignore`.
- **Hierarquia de Contexto no Next.js:** O hook `useFinance()` só pode ser executado em componentes filhos do `<FinanceProvider>`. Cada página modular (`app/budgets`, `app/goals`, `app/debts`) deve renderizar um componente de conteúdo interno encapsulado pelo `<DashboardLayout>`.
- **Estratégia Mobile First para Dashboards Financeiros:** Dashboards com tabelas ricas e gráficos analíticos exigem `min-width` seguro nas tabelas com contêineres de scroll lateral suave (`overflow-x-auto`) e substituição do padding estático da sidebar por `pl-0 lg:pl-64`.
- **Detecção de Intenções no Telegram:** Permitir que o usuário insira gastos naturais (ex: `45,90 Almoço`) sem a obrigatoriedade de barras (`/gasto`) aumenta drasticamente a taxa de adesão ao registro diário de despesas.
- **Modelagem de Sub-Parcelas Acumuladas:** Agrupar compras parceladas sob a mesma categoria ou credor (ex: Jarbas ou Cartão Vadir) permite ao usuário manter um único teto orçamentário mensal enquanto rastreia o desdobramento e término individual de cada compra. A ordenação por menor tempo residual ($total - atual + 1$) entrega previsibilidade instantânea de alívio no orçamento.
- **Classificação Sênior de Natureza Financeira (`category_nature`):** O sistema agora segrega rigorosamente as categorias entre `expense` (Despesa / Teto de Gastos) e `income` (Receita / Meta de Renda). Quando o usuário lança uma **Receita**, o seletor filtra exclusivamente categorias de entrada (`Salário & Renda Fixa`, `Freelance & Projetos`, `Investimentos & Dividendos`, etc.) e habilita a sub-classificação entre **Entrada Fixa** (CLT, Pró-Labore), **Freelance** (Contratos pontuais, Serviços) e **Rendimentos / Outros**. Ao lançar uma **Despesa**, filtra categorias de saída com sub-classificação entre **Custo Fixo Mensal**, **Cartão / Parcelas** e **Gastos Variáveis**.
- **Diferenciação Semântica de Salário Líquido vs Metas Abstratas (15/10/2026):** Categorias de entrada fixa (como Salário CLT e Pró-Labore) exigem comunicação direta sem ambiguidades: em vez de rótulos como "Previsão / Meta", o sistema adota "Valor do Salário Líquido Mensal (R$)" com auto-preenchimento no lançamento de transações e a opção inteligente de registrar imediatamente a entrada no caixa do mês corrente, além do botão de confirmação com 1 clique ("Confirmar Salário no Caixa") na página de orçamentos.

> **Data:** 17/10/2026

- **Fluxo Ponta a Ponta de Renda Fixa & Previsibilidade de Caixa:**
  - **Identificação Exata:** Categorias de receita fixa (`category_nature = 'income'` e `category_type = 'fixed'`) agora operam com foco no salário real líquido recebido.
  - **Lançamento Automático no Caixa:** No `CategoryModal`, o toggle inteligente `[ ✓ ] Lançar no Saldo deste mês agora?` permite que o usuário, ao definir o salário de R$ 3.500,00 e o dia 5, já crie atomicamente a transação de entrada no mês corrente sem etapas manuais redundantes.
  - **Botão de Ação Rápida em Orçamentos (`/budgets`):** Caso o mês ainda não registre o salário esperado, o card de receitas exibe `[ ✓ Confirmar Salário no Caixa ]`, permitindo liquidar o recebimento com um único clique.
  - **Auto-Preenchimento em Lançamentos:** Em `NewTransactionModal`, ao selecionar a categoria de Salário, o sistema automaticamente preenche o valor cadastrado na categoria e a descrição, acelerando o registro financeiro.
- **Resiliência Client-Side em Deploys na Nuvem (Vercel):**
  - Implementação de laço com auto-retry e intervalo de 800ms em requisições de formulários (`fetch`), mitigando erros transitórios de rede (`Failed to fetch`) causados por reciclagem de serverless functions durante rollouts de deploy.
  - Mensagens amigáveis e explicativas em caso de instabilidade na conexão, eliminando telas travadas para o usuário final.

> **Data:** 24/10/2026

- **Gestão Ágil de Saídas Diárias & Fracionamento de Tetos Orçamentários:**
  - **Atalhos Rápidos de 1 Clique:** No `NewTransactionModal`, introduzidos chips contextuais para despesas frequentes (`🛒 Supermercado`, `🥬 Feira Livre`, `⛽ Combustível`, `🍔 Delivery`, `💊 Farmácia`, `🏫 Escola`, `⚡ Luz/Energia`). Com um clique, preenche categoria, descrição e dados de pagamento.
  - **Botão de Confirmação de Saída / Pagamento Instantâneo:** Despesas registradas com status `pending` (a pagar) exibem o botão direto `[ Confirmar Saída ]` tanto na tabela principal de lançamentos quanto no extrato da categoria. Ao clicar, o status alterna para `completed` em tempo real sem exigir abertura de modais ou edição manual.
  - **Integração de Chave Pix & Dados Bancários:** Adicionadas colunas `pix_key` e `payment_info` nas tabelas `categories` e `transactions` do Supabase. Categorias como Escola, Luz ou Feira podem armazenar uma Chave Pix padrão, com botão `Copiar Pix` e auto-preenchimento nos novos lançamentos.
  - **Extrato Detalhado de Compras por Categoria (Ex: Feira R$ 2.000):** O novo componente `CategoryTransactionsModal` permite rastrear compras parciais dentro do teto mensal estabelecido (ex: compras de R$ 150, R$ 200, R$ 350). Apresenta a lista discriminada com datas, forma de pagamento, valor, saldo restante do teto e botões de confirmação rápida de saída.
  - **Edição & Exclusão Completa de Lançamentos:**
    - `NewTransactionModal` agora suporta modo de edição (`transactionToEdit`), preenchendo todos os campos e enviando atualizações via `PATCH /api/finance/transactions`.
    - No rodapé do modal de edição, adicionado o botão `[ Excluir ]` com confirmação de segurança.
    - O menu lateral direito (`RightSidebar` - Atividades Recentes), a tabela geral (`TransactionTable`) e o extrato de categoria (`CategoryTransactionsModal`) receberam botões diretos de **Editar** (`Pencil`) e **Excluir** (`Trash2`).
  - **Reestruturação Patrimonial em Macro-Gavetas (Centros de Custo):**
    - **Fim da Bagunça Visual:** Transição do modelo "plano" de categorias soltas para a arquitetura de **6 Macro-Gavetas Patrimoniais**:
      1. `🏠 Moradia & Habitação`: Pagamento fixo de casa, Energia Elétrica, Água & Saneamento, Internet Fibra.
      2. `🛒 Alimentação & Abastecimento`: Alimentação & Mercado, Feira Livre & Hortifruti.
      3. `🚗 Transporte & Mobilidade`: Combustível & Posto, Moto, Transporte & Carro.
      4. `💳 Cartões & Parcelamentos`: Jarbas, faturas e controle de compras parceladas.
      5. `👨‍👩‍👧 Família, Saúde & Educação`: Escola, Saúde & Farmácia.
      6. `🍿 Estilo de Vida & Lazer`: Streaming & Assinaturas, Lazer e Restaurantes.
      7. `💼 Fontes de Renda`: Salário AeC, Enfermagem, Massaranduba, Freelances e Dividendos.
    - **Remoção de Duplicidades:** Exclusão da categoria duplicada vazia `Salario`, consolidando em `Salario AeC` com salário líquido de R$ 3.500,00.
    - **Interface em Acordeão / Gavetas:** Em `/expenses` e `/budgets`, cada Macro-Gaveta possui barra de consumo global, teto consolidado, valor gasto e lista expansível das subcontas com seus respectivos vencimentos, situação de pagamento e chave Pix.
    - **Seleção Agrupada:** No formulário de lançamentos (`NewTransactionModal`), as opções de categoria agora aparecem agrupadas por `<optgroup>` para seleção rápida e intuitiva.


---




