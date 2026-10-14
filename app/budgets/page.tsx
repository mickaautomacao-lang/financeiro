'use client';

import React, { useState } from 'react';
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
  CreditCard,
  Repeat,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ICON_MAP } from '@/components/dashboard/CategoryModal';

function BudgetsContent() {
  const { categories, budgets, installments, openCategoryModal, openInstallmentsModal } =
    useFinance();
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'credit_card' | 'variable'>('all');

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

      {/* Grade de Categorias Cadastradas com Filtro por Tipo e Gestão de Parcelas */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-neon" />
              Categorias & Contas ({categories.length})
            </h3>
            <p className="text-xs text-graphite-400 mt-0.5">
              Organize entre despesas fixas, compras parceladas e gastos do dia a dia
            </p>
          </div>

          {/* Abas de Filtro */}
          <div className="flex items-center gap-1.5 p-1 bg-graphite-900 border border-border/80 rounded-lg text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap font-medium ${
                filterType === 'all'
                  ? 'bg-graphite-800 text-white shadow-sm'
                  : 'text-graphite-400 hover:text-white'
              }`}
            >
              Todas ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('credit_card')}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap font-medium flex items-center gap-1 ${
                filterType === 'credit_card'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-graphite-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3 h-3 text-purple-400" />
              Cartão / Parcelas (
              {categories.filter((c) => c.category_type === 'credit_card').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('fixed')}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap font-medium flex items-center gap-1 ${
                filterType === 'fixed'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-graphite-400 hover:text-white'
              }`}
            >
              <Repeat className="w-3 h-3 text-blue-400" />
              Fixas ({categories.filter((c) => c.category_type === 'fixed').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('variable')}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap font-medium flex items-center gap-1 ${
                filterType === 'variable'
                  ? 'bg-neon/15 text-neon border border-neon/30 shadow-sm'
                  : 'text-graphite-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3 h-3 text-neon" />
              Variáveis (
              {categories.filter((c) => c.category_type === 'variable' || !c.category_type).length})
            </button>
          </div>
        </div>

        {(() => {
          const filteredCategories = categories.filter((cat) => {
            if (filterType === 'all') return true;
            if (filterType === 'variable') return cat.category_type === 'variable' || !cat.category_type;
            return cat.category_type === filterType;
          });

          if (filteredCategories.length === 0) {
            return (
              <div className="p-8 text-center bg-surface border border-dashed border-border rounded-xl">
                <FolderPlus className="w-10 h-10 text-graphite-500 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-white">Nenhuma categoria neste filtro</h4>
                <p className="text-xs text-graphite-400 mt-1 max-w-sm mx-auto mb-4">
                  Cadastre uma categoria ou ajuste a classificação existente para visualizar aqui.
                </p>
                <button
                  onClick={() => openCategoryModal(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg shadow-neon-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Categoria</span>
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((cat) => {
                const budgetItem = budgets.find((b) => b.category_name === cat.name);
                const spent = budgetItem ? parseFloat(String(budgetItem.actual_spent)) || 0 : 0;
                const limit = parseFloat(String(cat.budget_limit)) || 0;
                const pct = limit > 0 ? (spent / limit) * 100 : 0;
                const isWarning = pct >= 80;
                const isOver = pct >= 100;

                // Parcelas ativas vinculadas a esta categoria
                const catInstallments = installments.filter(
                  (i) => i.category_id === cat.id && i.status === 'active'
                );
                const totalInstallmentsMonthly = catInstallments.reduce(
                  (sum, i) => sum + Number(i.installment_amount || 0),
                  0
                );

                const isCreditCardOrInstallment =
                  cat.category_type === 'credit_card' || catInstallments.length > 0;

                const IconComponent = ICON_MAP[cat.icon] || Layers;

                return (
                  <div
                    key={cat.id}
                    className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between hover:border-graphite-600 transition-all group relative overflow-hidden"
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

                        <div className="flex items-center gap-1">
                          {/* Tipo Badge */}
                          <span
                            className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                              cat.category_type === 'fixed'
                                ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                : cat.category_type === 'credit_card'
                                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                                : 'bg-graphite-800 text-graphite-400 border-border'
                            }`}
                          >
                            {cat.category_type === 'fixed'
                              ? 'Fixo'
                              : cat.category_type === 'credit_card'
                              ? 'Cartão'
                              : 'Variável'}
                          </span>

                          <button
                            onClick={() => openCategoryModal(cat)}
                            title="Editar Categoria"
                            className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-white truncate" title={cat.name}>
                          {cat.name}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-graphite-400 font-mono mt-0.5">
                          <span>Teto: {formatCurrency(limit)}</span>
                          {cat.category_type === 'fixed' && (
                            <span className="text-[11px] text-blue-300">
                              Vence dia {cat.due_day || 10}
                            </span>
                          )}
                          {cat.category_type === 'credit_card' && (
                            <span className="text-[10px] text-purple-300">
                              Fecha dia {cat.closing_day || 5} • Vence dia {cat.due_day || 15}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bloco de Parcelas / Sub-compras */}
                      {isCreditCardOrInstallment && (
                        <div className="mt-3 p-2.5 rounded-lg bg-graphite-900/90 border border-purple-500/25 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] text-graphite-400 flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-purple-400" />
                              Parcelas do Mês:
                            </span>
                            <span className="font-mono font-bold text-purple-300">
                              {formatCurrency(totalInstallmentsMonthly)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-graphite-400 pt-0.5">
                            <span>
                              {catInstallments.length}{' '}
                              {catInstallments.length === 1 ? 'compra ativa' : 'compras ativas'}
                            </span>
                            <button
                              type="button"
                              onClick={() => openInstallmentsModal(cat)}
                              className="text-neon hover:underline font-semibold flex items-center gap-0.5"
                            >
                              Ver Detalhes &gt;
                            </button>
                          </div>
                        </div>
                      )}
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

                      {/* Botão de Gestão de Parcelas para Cartões */}
                      {isCreditCardOrInstallment && (
                        <button
                          type="button"
                          onClick={() => openInstallmentsModal(cat)}
                          className="w-full mt-2 py-1.5 px-2.5 text-xs font-medium text-white bg-graphite-900 hover:bg-graphite-800 border border-border hover:border-purple-500/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                          <span>Gerenciar Parcelas ({catInstallments.length})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
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
