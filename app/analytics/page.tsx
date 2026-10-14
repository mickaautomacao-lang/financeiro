'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { LineChart, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="neon" className="gap-1 text-[11px]">
            <Sparkles className="h-3 w-3" />
            Inteligência Analítica
          </Badge>
        </div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <LineChart className="h-5 w-5 text-neon" />
          Analytics & Indicadores Avançados
        </h2>
        <p className="text-xs text-graphite-400 mt-0.5">
          Projeções de fluxo de caixa, distribuição percentual e análise de risco orçamentário
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonutChart />
        </div>
      </div>

      <BudgetProgress />
    </DashboardLayout>
  );
}

