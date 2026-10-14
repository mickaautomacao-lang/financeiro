'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import {
  PieChart,
  Plus,
  Pencil,
  AlertTriangle,
  FolderPlus,
  Layers,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ICON_MAP } from '@/components/dashboard/CategoryModal';

function BudgetsContent() {
  const { categories, budgets, openCategoryModal } = useFinance();

  // Calcular métricas gerais
  const totalPlanned = categories.reduce(
    (acc, c) => acc + (parseFloat(String(c.budget_limit)) || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (acc, b) => acc + (parseFloat(String(b.actual_spent)) || 0),
    0
  );

  const alertCount = budgets.filter((b) => (parseFloat(String(b.percentage_used)) || 0) >= 80).length;

  return (
    <div className="space-y-8">
      {/* Header com Ação Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChart className="h-5 w-5 text-neon" />
            Orçamentos & Gestão de Categorias
          </h2>
          <p className="text-xs text-graphite-400 mt-0.5">
            Cadastre novas categorias, ajuste tetos de gastos e controle a regra de 80% do Telegram
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCategoryModal(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg shadow-neon-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* KPI Cards Rápidos de Orçamento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-neon/10 text-neon">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Teto Total Planejado
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {formatCurrency(totalPlanned)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-expense/10 text-expense">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Total Gasto no Período
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {formatCurrency(totalSpent)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Categorias em Alerta (&gt;80%)
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {alertCount} / {categories.length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade de Categorias Cadastradas com Ação de Edição */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-neon" />
            Categorias Ativas ({categories.length})
          </h3>
          <span className="text-xs text-graphite-400">
            Clique no ícone de lápis em qualquer categoria para editar ou alterar seu teto
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-dashed border-border rounded-xl">
            <FolderPlus className="w-10 h-10 text-graphite-500 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-white">Nenhuma categoria encontrada</h4>
            <p className="text-xs text-graphite-400 mt-1 max-w-sm mx-auto mb-4">
              Crie categorias personalizadas para classificar suas transações e definir tetos de gastos com alertas.
            </p>
            <button
              onClick={() => openCategoryModal(null)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg shadow-neon-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Categoria</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const budgetItem = budgets.find((b) => b.category_name === cat.name);
              const spent = budgetItem ? parseFloat(String(budgetItem.actual_spent)) || 0 : 0;
              const limit = parseFloat(String(cat.budget_limit)) || 0;
              const pct = limit > 0 ? (spent / limit) * 100 : 0;
              const isWarning = pct >= 80;
              const isOver = pct >= 100;

              const IconComponent = ICON_MAP[cat.icon] || Layers;

              return (
                <div
                  key={cat.id}
                  className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between hover:border-graphite-600 transition-all group"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: `${cat.color || '#A3E635'}20`,
                          color: cat.color || '#A3E635',
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <button
                        onClick={() => openCategoryModal(cat)}
                        title="Editar Categoria"
                        className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-white truncate" title={cat.name}>
                        {cat.name}
                      </h4>
                      <p className="text-xs text-graphite-400 font-mono mt-0.5">
                        Teto: {formatCurrency(limit)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/70 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-graphite-400">Gasto: {formatCurrency(spent)}</span>
                      <span
                        className={
                          isOver
                            ? 'text-expense font-bold'
                            : isWarning
                            ? 'text-amber-400 font-semibold'
                            : 'text-neon font-medium'
                        }
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-graphite-900 rounded-full overflow-hidden border border-border/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-expense' : isWarning ? 'bg-amber-400' : 'bg-neon'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabela Comparativa Detalhada */}
      <BudgetProgress limit={0} showAddButton={false} />
    </div>
  );
}

export default function BudgetsPage() {
  return (
    <DashboardLayout>
      <BudgetsContent />
    </DashboardLayout>
  );
}
