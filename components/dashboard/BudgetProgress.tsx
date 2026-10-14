'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';

export function BudgetProgress() {
  const { budgets, categories } = useFinance();

  const displayList = budgets.length > 0 ? budgets : categories.map((c) => ({
    category_name: c.name,
    planned_amount: c.budget_limit,
    actual_spent: 0,
    remaining_budget: c.budget_limit,
    percentage_used: 0,
    alert_threshold_reached: false,
    category_color: c.color,
  }));

  return (
    <Card className="border-border bg-surface">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            Planejado vs. Realizado (Limites Mensais)
            <Badge variant="neon" className="text-[10px] py-0">
              Regra 80% Ativa
            </Badge>
          </CardTitle>
          <p className="text-xs text-graphite-400 mt-0.5">
            Monitoramento de categorias com disparo de alerta no Telegram
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {displayList.length === 0 ? (
          <div className="py-6 text-center text-xs text-graphite-400">
            Nenhuma categoria de orçamento configurada.
          </div>
        ) : (
          displayList.slice(0, 5).map((item) => {
            const actualSpent = parseFloat(String(item.actual_spent)) || 0;
            const plannedAmount = parseFloat(String(item.planned_amount)) || 0;
            const percentageUsed = parseFloat(String(item.percentage_used)) || 0;
            const remainingBudget = parseFloat(String(item.remaining_budget)) || (plannedAmount - actualSpent);

            const isWarning = percentageUsed >= 80;
            const isOver = percentageUsed >= 100;

            return (
              <div key={item.category_name} className="space-y-1.5">
                {/* Header da Categoria */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.category_color || '#A3E635' }}
                    />
                    <span className="font-medium text-white">{item.category_name}</span>
                    {isWarning && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        &gt; 80% (Notificado)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-graphite-300">
                      <strong className="text-white">
                        {formatCurrency(actualSpent)}
                      </strong>{' '}
                      / {formatCurrency(plannedAmount)}
                    </span>
                    <span
                      className={`font-semibold text-right w-12 ${
                        isOver
                          ? 'text-expense'
                          : isWarning
                          ? 'text-amber-400'
                          : 'text-neon'
                      }`}
                    >
                      {percentageUsed.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso com Indicador de Estágio */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-graphite-900 border border-border">
                  {/* Marcador dos 80% (Threshold de Alerta) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-graphite-600 z-10"
                    style={{ left: '80%' }}
                    title="Gatilho de alerta n8n (80%)"
                  />

                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-expense shadow-[0_0_10px_rgba(248,113,113,0.5)]'
                        : isWarning
                        ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                        : 'bg-neon shadow-neon-sm'
                    }`}
                    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                  />
                </div>

                {/* Informação de Saldo Restante */}
                <div className="flex items-center justify-between text-[11px] text-graphite-400 pt-0.5">
                  <span>
                    Disponível para gastar:{' '}
                    <span
                      className={
                        remainingBudget < 0
                          ? 'text-expense font-semibold'
                          : 'text-graphite-200 font-medium'
                      }
                    >
                      {formatCurrency(remainingBudget)}
                    </span>
                  </span>
                  <span>Limite mensal</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
