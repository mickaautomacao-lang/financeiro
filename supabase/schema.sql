-- ==============================================================================
-- SISTEMA DE CONTROLE FINANCEIRO PESSOAL (SUPABASE / POSTGRESQL SCHEMA)
-- ==============================================================================
-- Descrição: Modelagem completa das tabelas centrais com Row Level Security (RLS),
-- triggers para updated_at, índices analíticos e views para planejado x realizado.
-- ==============================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE goal_status AS ENUM ('in_progress', 'completed', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE debt_status AS ENUM ('active', 'paid', 'negotiating');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Função utilitária para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TABELA: categories (Orçamentos e Categorias)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#A3E635',
    icon VARCHAR(50) DEFAULT 'Tag',
    budget_limit NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (budget_limit >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

COMMENT ON TABLE public.categories IS 'Categorias financeiras de receitas e despesas com teto orçamentário mensal.';
COMMENT ON COLUMN public.categories.budget_limit IS 'Limite orçamentário planejado para cálculo de planejado x realizado.';

-- ==============================================================================
-- TABELA: transactions (Transações Financeiras)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    type transaction_type NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status transaction_status NOT NULL DEFAULT 'completed',
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'pix',
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'google_sheets', 'n8n_sync'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.transactions IS 'Movimentações financeiras de receitas e despesas.';

-- ==============================================================================
-- TABELA: goals (Metas e Reserva de Emergência)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    deadline DATE,
    status goal_status NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.goals IS 'Metas financeiras de curto, médio e longo prazo (reserva de emergência, aquisições).';

-- ==============================================================================
-- TABELA: debts (Controle de Dívidas e Obrigações)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creditor VARCHAR(120) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount > 0),
    remaining_amount NUMERIC(14, 2) NOT NULL CHECK (remaining_amount >= 0),
    interest_rate NUMERIC(6, 2) DEFAULT 0.00 CHECK (interest_rate >= 0),
    due_date DATE NOT NULL,
    status debt_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.debts IS 'Dívidas, financiamentos e compromissos com data de vencimento e juros.';

-- ==============================================================================
-- TRIGGERS DE UPDATED_AT
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_goals_updated_at ON public.goals;
CREATE TRIGGER trg_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_debts_updated_at ON public.debts;
CREATE TRIGGER trg_debts_updated_at
    BEFORE UPDATE ON public.debts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_debts_user_due_date ON public.debts(user_id, due_date ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Políticas para categories
DROP POLICY IF EXISTS "Usuários gerenciam suas próprias categorias - SELECT" ON public.categories;
CREATE POLICY "Usuários gerenciam suas próprias categorias - SELECT"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias categorias - INSERT" ON public.categories;
CREATE POLICY "Usuários gerenciam suas próprias categorias - INSERT"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias categorias - UPDATE" ON public.categories;
CREATE POLICY "Usuários gerenciam suas próprias categorias - UPDATE"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias categorias - DELETE" ON public.categories;
CREATE POLICY "Usuários gerenciam suas próprias categorias - DELETE"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para transactions
DROP POLICY IF EXISTS "Usuários gerenciam suas próprias transações - SELECT" ON public.transactions;
CREATE POLICY "Usuários gerenciam suas próprias transações - SELECT"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias transações - INSERT" ON public.transactions;
CREATE POLICY "Usuários gerenciam suas próprias transações - INSERT"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias transações - UPDATE" ON public.transactions;
CREATE POLICY "Usuários gerenciam suas próprias transações - UPDATE"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias transações - DELETE" ON public.transactions;
CREATE POLICY "Usuários gerenciam suas próprias transações - DELETE"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para goals
DROP POLICY IF EXISTS "Usuários gerenciam suas próprias metas - SELECT" ON public.goals;
CREATE POLICY "Usuários gerenciam suas próprias metas - SELECT"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias metas - INSERT" ON public.goals;
CREATE POLICY "Usuários gerenciam suas próprias metas - INSERT"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias metas - UPDATE" ON public.goals;
CREATE POLICY "Usuários gerenciam suas próprias metas - UPDATE"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias metas - DELETE" ON public.goals;
CREATE POLICY "Usuários gerenciam suas próprias metas - DELETE"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para debts
DROP POLICY IF EXISTS "Usuários gerenciam suas próprias dívidas - SELECT" ON public.debts;
CREATE POLICY "Usuários gerenciam suas próprias dívidas - SELECT"
    ON public.debts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias dívidas - INSERT" ON public.debts;
CREATE POLICY "Usuários gerenciam suas próprias dívidas - INSERT"
    ON public.debts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias dívidas - UPDATE" ON public.debts;
CREATE POLICY "Usuários gerenciam suas próprias dívidas - UPDATE"
    ON public.debts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários gerenciam suas próprias dívidas - DELETE" ON public.debts;
CREATE POLICY "Usuários gerenciam suas próprias dívidas - DELETE"
    ON public.debts FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- VIEW ANALÍTICA: PLANEJADO X REALIZADO (MÊS CORRENTE)
-- Utilizada pelo Dashboard e pelos Gatilhos de Alerta do n8n
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_budget_vs_actual AS
SELECT 
    c.user_id,
    c.id AS category_id,
    c.name AS category_name,
    c.color AS category_color,
    c.budget_limit AS planned_amount,
    COALESCE(SUM(t.amount), 0.00) AS actual_spent,
    (c.budget_limit - COALESCE(SUM(t.amount), 0.00)) AS remaining_budget,
    CASE 
        WHEN c.budget_limit > 0 THEN 
            ROUND((COALESCE(SUM(t.amount), 0.00) / c.budget_limit) * 100, 2)
        ELSE 0.00 
    END AS percentage_used,
    CASE 
        WHEN c.budget_limit > 0 AND (COALESCE(SUM(t.amount), 0.00) / c.budget_limit) >= 0.80 THEN TRUE
        ELSE FALSE
    END AS alert_threshold_reached
FROM public.categories c
LEFT JOIN public.transactions t 
    ON t.category_id = c.id 
    AND t.type = 'expense'
    AND t.status = 'completed'
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY c.user_id, c.id, c.name, c.color, c.budget_limit;

