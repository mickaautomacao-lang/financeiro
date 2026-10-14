'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { Badge } from '@/components/ui/badge';
import { Zap, ShieldCheck } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';

function DashboardView() {
  const { kpi, transactions } = useFinance();

  return (
    <>
      {/* 1. Banner Superior de Telemetria Contábil */}
      <div className="relative overflow-hidden rounded-2xl border border-neon/30 bg-gradient-to-r from-surface via-graphite-900 to-surface p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-neon/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="neon" className="gap-1 text-[11px]">
                <Zap className="h-3 w-3 fill-neon" />
                Motor de Precisão Contábil Ativo
              </Badge>
              <span className="text-xs text-graphite-400 font-mono">
                Supabase PostgreSQL • RLS Ativo
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Controle Financeiro de Alta Performance
            </h2>
            <p className="text-xs text-graphite-300 mt-0.5">
              Rastreamento de cada centavo em tempo real. Integrado diretamente ao Telegram <strong>@dashfina_bot</strong> e Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] text-graphite-400">Status Contábil</p>
              <p className="text-xs font-semibold text-neon font-mono">
                {transactions.length > 0
                  ? `${transactions.length} Lançamentos • Saldo: ${formatCurrency(kpi.currentBalance)}`
                  : 'Dashboard Zerado e Pronto'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cards de KPI no Topo */}
      <section>
        <KPICards />
      </section>

      {/* 3. Seção Gráfica: Fluxo de Caixa (Área) e Gastos por Categoria (Rosca) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonutChart />
        </div>
      </section>

      {/* 4. Seção Analítica: Planejado x Realizado e Tabela de Transações Recentes */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BudgetProgress />
        </div>
        <div className="lg:col-span-2">
          <TransactionTable />
        </div>
      </section>
    </>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardView />
    </DashboardLayout>
  );
}
