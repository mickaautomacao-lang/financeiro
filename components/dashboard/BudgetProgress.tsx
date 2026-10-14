'use client';

import React from 'react';
import { AlertTriangle, Plus, Pencil, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';

interface BudgetProgressProps {
  limit?: number;
  showAddButton?: boolean;
}

export function BudgetProgress({ limit = 5, showAddButton = true }: BudgetProgressProps) {
  const { budgets, categories, installments, openCategoryModal, openInstallmentsModal } =
    useFinance();

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
      <CardHeader className="flex flex-row items-center justify-between pb-3.5 gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-bold text-white truncate">
              Planejado vs. Realizado
            </CardTitle>
            <span className="hidden sm:inline-flex items-center text-[10px] font-semibold text-neon bg-neon-muted px-1.5 py-0.5 rounded border border-neon/30 whitespace-nowrap">
              Regra 80%
            </span>
          </div>
          <p className="text-[11px] text-graphite-400 mt-0.5 truncate">
            Limites mensais e alertas Telegram
          </p>
        </div>

        {showAddButton && (
          <button
            type="button"
            onClick={() => openCategoryModal(null)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg transition-all shadow-neon-sm whitespace-nowrap flex-shrink-0"
            title="Criar nova categoria"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Categoria</span>
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
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

            const isWarning = percentageUsed >= 80;
            const isOver = percentageUsed >= 100;

            const categoryData = categories.find((c) => c.name === item.category_name);

            return (
              <div
                key={item.category_name}
                className="space-y-2 p-2.5 rounded-xl bg-graphite-900/40 hover:bg-graphite-900/80 border border-transparent hover:border-border/70 transition-all group"
              >
                {/* Linha 1: Nome da Categoria + Percentual */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.category_color || '#A3E635' }}
                    />
                    <span
                      className="font-medium text-xs text-white truncate max-w-[140px] sm:max-w-[200px]"
                      title={item.category_name}
                    >
                      {item.category_name}
                    </span>

                    {/* Botão de Editar Categoria */}
                    <button
                      type="button"
                      onClick={() => openCategoryModal(categoryData || null)}
                      title="Editar categoria e teto"
                      className="opacity-60 group-hover:opacity-100 p-0.5 text-graphite-400 hover:text-neon rounded transition-opacity flex-shrink-0"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>

                    {/* Botão de Ver Parcelas para Cartões/Parcelados */}
                    {categoryData &&
                      (categoryData.category_type === 'credit_card' ||
                        installments.some((i) => i.category_id === categoryData.id && i.status === 'active')) && (
                        <button
                          type="button"
                          onClick={() => openInstallmentsModal(categoryData)}
                          title="Ver e Gerenciar Parcelas desta Categoria"
                          className="px-1.5 py-0.5 text-[9px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30 rounded flex items-center gap-0.5 hover:bg-purple-500/25 transition-colors flex-shrink-0"
                        >
                          <CreditCard className="w-2.5 h-2.5 text-purple-400" />
                          <span>Parcelas</span>
                        </button>
                      )}

                    {isWarning && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/30 whitespace-nowrap flex-shrink-0">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        80%
                      </span>
                    )}
                  </div>

                  {/* Percentual em Badge Monospaçada */}
                  <span
                    className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded border whitespace-nowrap flex-shrink-0 ${
                      isOver
                        ? 'text-expense border-expense/30 bg-expense/10'
                        : isWarning
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                        : 'text-neon border-neon/30 bg-neon/10'
                    }`}
                  >
                    {percentageUsed.toFixed(1)}%
                  </span>
                </div>

                {/* Linha 2: Barra de Progresso Suave */}
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-graphite-950 border border-border/60">
                  {/* Marcador dos 80% (Threshold de Alerta) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-graphite-600 z-10"
                    style={{ left: '80%' }}
                    title="Gatilho de alerta n8n (80%)"
                  />

                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-expense shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                        : isWarning
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                        : 'bg-neon shadow-neon-sm'
                    }`}
                    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                  />
                </div>

                {/* Linha 3: Valores Financeiros Proporcionais (Gasto vs Teto) */}
                <div className="flex items-center justify-between text-[11px] font-mono text-graphite-400 pt-0.5">
                  <span className="truncate">
                    Gasto:{' '}
                    <strong className="text-white font-semibold">
                      {formatCurrency(actualSpent)}
                    </strong>
                  </span>

                  <span className="truncate text-right flex items-center gap-1.5 justify-end">
                    {categoryData?.due_day && (
                      <span className="text-[10px] text-graphite-500 font-mono">
                        vence d.{categoryData.due_day} •
                      </span>
                    )}
                    {plannedAmount > 0 ? (
                      <>
                        Teto:{' '}
                        <span className="text-graphite-300 font-medium">
                          {formatCurrency(plannedAmount)}
                        </span>
                      </>
                    ) : (
                      <span className="text-graphite-500 italic text-[10px]">Sem teto</span>
                    )}
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
