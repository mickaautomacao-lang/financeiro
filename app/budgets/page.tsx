'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { PieChart } from 'lucide-react';

export default function BudgetsPage() {
  return (
    <DashboardLayout>
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PieChart className="h-5 w-5 text-neon" />
          Orçamentos & Tetos Mensais
        </h2>
        <p className="text-xs text-graphite-400 mt-0.5">
          Controle de limites por categoria e monitoramento da regra de 80% do Telegram
        </p>
      </div>

      <BudgetProgress />
    </DashboardLayout>
  );
}

