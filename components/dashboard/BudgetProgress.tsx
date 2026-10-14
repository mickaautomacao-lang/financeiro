'use client';

import React from 'react';
import { AlertTriangle, Plus, Pencil } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';

interface BudgetProgressProps {
  limit?: number;
  showAddButton?: boolean;
}

export function BudgetProgress({ limit = 5, showAddButton = true }: BudgetProgressProps) {
  const { budgets, categories, openCategoryModal } = useFinance();

  const displayList = budgets.length > 0 ? budgets : categories.map((c) => ({
    category_id: c.id,
    category_name: c.name,
    planned_amount: c.budget_limit,
    actual_spent: 0,
    remaining_budget: c.budget_limit,
    percentage_used: 0,
    alert_threshold_reached: false,
    category_color: c.color,
  }));

  const itemsToShow = limit ? displayList.slice(0, limit) : displayList;

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

        {showAddButton && (
          <button
            type="button"
            onClick={() => openCategoryModal(null)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg transition-all shadow-neon-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Categoria</span>
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {displayList.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-graphite-400">
              Nenhuma categoria de orçamento cadastrada no momento.
            </p>
            <button
              type="button"
              onClick={() => openCategoryModal(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg transition-all shadow-neon-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Primeira Categoria</span>
            </button>
          </div>
        ) : (
          itemsToShow.map((item) => {
            const actualSpent = parseFloat(String(item.actual_spent)) || 0;
            const plannedAmount = parseFloat(String(item.planned_amount)) || 0;
            const percentageUsed = parseFloat(String(item.percentage_used)) || 0;
            const remainingBudget =
              parseFloat(String(item.remaining_budget)) || (plannedAmount - actualSpent);

            const isWarning = percentageUsed >= 80;
            const isOver = percentageUsed >= 100;

            const categoryData = categories.find((c) => c.name === item.category_name);

            return (
              <div
                key={item.category_name}
                className="space-y-1.5 p-2 rounded-lg hover:bg-graphite-900/50 transition-colors group"
              >
                {/* Header da Categoria */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.category_color || '#A3E635' }}
                    />
                    <span className="font-semibold text-white">{item.category_name}</span>

                    {/* Botão de Editar Categoria */}
                    <button
                      type="button"
                      onClick={() => openCategoryModal(categoryData || null)}
                      title="Editar nome, teto orçamentário ou cor desta categoria"
                      className="opacity-70 group-hover:opacity-100 p-1 text-graphite-400 hover:text-neon hover:bg-graphite-800 rounded transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>

                    {isWarning && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        &gt; 80% (Notificado)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-graphite-300">
                      <strong className="text-white">{formatCurrency(actualSpent)}</strong> /{' '}
                      {formatCurrency(plannedAmount)}
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
                  <span className="font-mono text-[10px] text-graphite-400">
                    {plannedAmount > 0
                      ? `Teto: ${formatCurrency(plannedAmount)}`
                      : 'Sem teto definido'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
