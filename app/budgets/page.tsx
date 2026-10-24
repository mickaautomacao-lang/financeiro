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
  Check,
  Receipt,
  CheckCircle2,
  GripVertical,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ICON_MAP } from '@/components/dashboard/CategoryModal';
import { EditGroupModal } from '@/components/dashboard/EditGroupModal';
import { QuickExpenseModal } from '@/components/dashboard/QuickExpenseModal';
import type { Category } from '@/types/database.types';

const GROUP_ORDER = [
  'Moradia & Habitação',
  'Alimentação & Abastecimento',
  'Transporte & Mobilidade',
  'Cartões & Parcelamentos',
  'Família, Saúde & Educação',
  'Estilo de Vida & Lazer',
  'Fontes de Renda',
  'Outros',
];

const GROUP_METADATA: Record<
  string,
  { icon: string; color: string; desc: string }
> = {
  'Moradia & Habitação': {
    icon: '🏠',
    color: '#38BDF8',
    desc: 'Custos da base: prestação/aluguel, condomínio, luz, água e internet',
  },
  'Alimentação & Abastecimento': {
    icon: '🛒',
    color: '#10B981',
    desc: 'Nutrição essencial: feira livre, supermercado e padaria',
  },
  'Transporte & Mobilidade': {
    icon: '🚗',
    color: '#F59E0B',
    desc: 'Deslocamentos: combustível, seguro, IPVA, manutenção e apps',
  },
  'Cartões & Parcelamentos': {
    icon: '💳',
    color: '#A855F7',
    desc: 'Faturas e compras em 3x, 6x, 12x com projeção de término',
  },
  'Família, Saúde & Educação': {
    icon: '👨‍👩‍👧',
    color: '#EC4899',
    desc: 'Desenvolvimento e bem-estar: escola, farmácia e consultas',
  },
  'Estilo de Vida & Lazer': {
    icon: '🍿',
    color: '#6366F1',
    desc: 'Qualidade de vida consciente: streaming, restaurantes e lazer',
  },
  'Fontes de Renda': {
    icon: '💼',
    color: '#4ADE80',
    desc: 'Salário CLT, Pró-Labore, freelances e rendimentos',
  },
  Outros: {
    icon: '📦',
    color: '#94A3B8',
    desc: 'Despesas diversas e avulsas',
  },
};

function getGroupMeta(groupName: string) {
  if (GROUP_METADATA[groupName]) return GROUP_METADATA[groupName];
  const lower = groupName.toLowerCase();
  if (lower.includes('mora') || lower.includes('casa') || lower.includes('habita') || lower.includes('lar')) {
    return { icon: '🏠', color: '#38BDF8', desc: 'Custos da moradia, aluguel, condomínio e contas do lar' };
  }
  if (lower.includes('alim') || lower.includes('merc') || lower.includes('feir') || lower.includes('nutri')) {
    return { icon: '🛒', color: '#10B981', desc: 'Alimentação, feira, supermercado e mantimentos' };
  }
  if (lower.includes('trans') || lower.includes('auto') || lower.includes('carro') || lower.includes('moto')) {
    return { icon: '🚗', color: '#F59E0B', desc: 'Deslocamentos, combustível, manutenção e transporte' };
  }
  if (lower.includes('cart') || lower.includes('parce') || lower.includes('fatur')) {
    return { icon: '💳', color: '#A855F7', desc: 'Faturas de cartão de crédito e compras parceladas' };
  }
  if (lower.includes('fam') || lower.includes('saud') || lower.includes('educ') || lower.includes('esco')) {
    return { icon: '👨‍👩‍👧', color: '#EC4899', desc: 'Saúde, educação, farmácia e bem-estar familiar' };
  }
  if (lower.includes('laz') || lower.includes('vid') || lower.includes('stre') || lower.includes('rest')) {
    return { icon: '🍿', color: '#6366F1', desc: 'Lazer, assinaturas, saídas e entretenimento' };
  }
  if (lower.includes('rend') || lower.includes('sala') || lower.includes('entra')) {
    return { icon: '💼', color: '#4ADE80', desc: 'Fontes de renda, salário, freelances e entradas' };
  }
  return { icon: '📁', color: '#38BDF8', desc: 'Gaveta orçamentária personalizada' };
}

function BudgetsContent() {
  const {
    categories,
    budgets,
    installments,
    transactions,
    refreshData,
    openCategoryModal,
    openInstallmentsModal,
    openCategoryTransactionsModal,
  } = useFinance();
  const [natureTab, setNatureTab] = useState<'expense' | 'income'>('expense');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [payingCategory, setPayingCategory] = useState<Category | null>(null);
  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [isMovingCategory, setIsMovingCategory] = useState(false);
  const [movingCategoryTarget, setMovingCategoryTarget] = useState<Category | null>(null);

  const handleMoveCategoryToGroup = async (catId: string, targetGroup: string) => {
    const targetCat = categories.find((c) => c.id === catId);
    if (!targetCat || targetCat.group_name === targetGroup) return;

    setIsMovingCategory(true);
    try {
      const res = await fetch('/api/finance/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: catId,
          group_name: targetGroup,
        }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Erro ao mover categoria de gaveta:', err);
    } finally {
      setIsMovingCategory(false);
      setDraggedCatId(null);
      setDragOverGroup(null);
    }
  };

  // Separar categorias por natureza
  const expenseCategories = categories.filter((c) => c.category_nature !== 'income');
  const incomeCategories = categories.filter((c) => c.category_nature === 'income');

  // Métricas de Despesas
  const totalPlannedExpense = expenseCategories.reduce(
    (acc, c) => acc + (parseFloat(String(c.budget_limit)) || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (acc, b) => acc + (parseFloat(String(b.actual_spent)) || 0),
    0
  );

  const alertCount = budgets.filter((b) => (parseFloat(String(b.percentage_used)) || 0) >= 80).length;

  // Métricas de Receitas
  const totalTargetIncome = incomeCategories.reduce(
    (acc, c) => acc + (parseFloat(String(c.budget_limit)) || 0),
    0
  );

  const totalRealizedIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + (parseFloat(String(t.amount)) || 0), 0);

  const incomePct = totalTargetIncome > 0 ? (totalRealizedIncome / totalTargetIncome) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header com Ação Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChart className="h-5 w-5 text-neon" />
            Planejamento & Tetos Orçamentários
          </h2>
          <p className="text-xs text-graphite-400 mt-0.5">
            Calibre os tetos mensais por gaveta patrimonial, monitore a regra de 80% e controle suas previsões de renda e parcelamentos
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

      {/* Tabs Principais: Despesas (Tetos) vs Receitas (Metas) */}
      <div className="flex items-center gap-2 p-1.5 bg-graphite-900 border border-border rounded-xl w-full sm:w-fit">
        <button
          type="button"
          onClick={() => {
            setNatureTab('expense');
            setFilterType('all');
          }}
          className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            natureTab === 'expense'
              ? 'bg-expense/20 text-expense border border-expense/40 shadow-sm'
              : 'text-graphite-400 hover:text-white'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-expense" />
          <span>Despesas & Tetos ({expenseCategories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setNatureTab('income');
            setFilterType('all');
          }}
          className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            natureTab === 'income'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-graphite-400 hover:text-white'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Receitas & Previsões ({incomeCategories.length})</span>
        </button>
      </div>

      {/* KPI Cards Rápidos Contextuais */}
      {natureTab === 'expense' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border bg-surface">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-neon/10 text-neon">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                  Teto Total de Despesas
                </p>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">
                  {formatCurrency(totalPlannedExpense)}
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
                  {alertCount} / {expenseCategories.length}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border bg-surface">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                  Meta Total de Renda Mensal
                </p>
                <h3 className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {formatCurrency(totalTargetIncome)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                  Total Recebido no Mês
                </p>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">
                  {formatCurrency(totalRealizedIncome)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-surface">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-neon/10 text-neon">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                  Meta Realizada
                </p>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">
                  {incomePct.toFixed(1)}% atingido
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade de Categorias com Filtro por Tipo */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-neon" />
              {natureTab === 'expense'
                ? `Categorias de Despesa (${expenseCategories.length})`
                : `Fontes de Renda & Receitas (${incomeCategories.length})`}
            </h3>
            <p className="text-xs text-graphite-400 mt-0.5">
              {natureTab === 'expense'
                ? 'Organize entre custos fixos mensais, compras parceladas e gastos variáveis'
                : 'Monitore entradas fixas (salário), freelances e rendimentos previstos'}
            </p>
          </div>

          {/* Abas de Filtro Contextuais */}
          {natureTab === 'expense' ? (
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
                Todas ({expenseCategories.length})
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
                {expenseCategories.filter((c) => c.category_type === 'credit_card').length})
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
                Fixas ({expenseCategories.filter((c) => c.category_type === 'fixed').length})
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
                {expenseCategories.filter((c) => c.category_type === 'variable' || !c.category_type).length})
              </button>
            </div>
          ) : (
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
                Todas ({incomeCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('fixed')}
                className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap font-medium flex items-center gap-1 ${
                  filterType === 'fixed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-graphite-400 hover:text-white'
                }`}
              >
                <Repeat className="w-3 h-3 text-emerald-400" />
                Entradas Fixas ({incomeCategories.filter((c) => c.category_type === 'fixed').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('variable')}
                className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap font-medium flex items-center gap-1 ${
                  filterType === 'variable'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-graphite-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3 h-3 text-amber-400" />
                Freelances & Outros (
                {incomeCategories.filter((c) => c.category_type !== 'fixed').length})
              </button>
            </div>
          )}
        </div>

        {(() => {
          const currentCategories = natureTab === 'expense' ? expenseCategories : incomeCategories;

          const filteredCategories = currentCategories.filter((cat) => {
            if (filterType === 'all') return true;
            if (natureTab === 'expense') {
              if (filterType === 'variable') return cat.category_type === 'variable' || !cat.category_type;
              return cat.category_type === filterType;
            } else {
              if (filterType === 'fixed') return cat.category_type === 'fixed';
              return cat.category_type !== 'fixed';
            }
          });

          if (filteredCategories.length === 0) {
            return (
              <div className="p-8 text-center bg-surface border border-dashed border-border rounded-xl">
                <FolderPlus className="w-10 h-10 text-graphite-500 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-white">
                  Nenhuma categoria de {natureTab === 'expense' ? 'despesa' : 'receita'} encontrada
                </h4>
                <p className="text-xs text-graphite-400 mt-1 max-w-sm mx-auto mb-4">
                  Cadastre uma nova categoria de {natureTab === 'expense' ? 'despesa' : 'receita'} para organizar suas finanças.
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

          // Agrupamento por Macro-Gavetas
          const groupsMap: Record<string, typeof filteredCategories> = {};
          GROUP_ORDER.forEach((g) => {
            groupsMap[g] = [];
          });
          filteredCategories.forEach((cat) => {
            const g = cat.group_name || (natureTab === 'income' ? 'Fontes de Renda' : 'Outros');
            if (!groupsMap[g]) groupsMap[g] = [];
            groupsMap[g].push(cat);
          });

          const activeGroups = Object.entries(groupsMap).filter(([_, cats]) => cats.length > 0);

          return (
            <div className="space-y-8">
              {activeGroups.map(([group, cats]) => {
                const meta = getGroupMeta(group);
                const isDropTarget =
                  dragOverGroup === group &&
                  draggedCatId &&
                  !cats.some((c) => c.id === draggedCatId);

                const groupLimit = cats.reduce(
                  (sum, c) => sum + (parseFloat(String(c.budget_limit)) || 0),
                  0
                );
                const groupSpent = cats.reduce((sum, c) => {
                  const b = budgets.find((item) => item.category_name === c.name);
                  return sum + (b ? parseFloat(String(b.actual_spent)) || 0 : 0);
                }, 0);
                const groupPct = groupLimit > 0 ? (groupSpent / groupLimit) * 100 : 0;

                return (
                  <div
                    key={group}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverGroup !== group) {
                        setDragOverGroup(group);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                      if (dragOverGroup === group) {
                        setDragOverGroup(null);
                      }
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const droppedCatId =
                        e.dataTransfer.getData('text/plain') || draggedCatId;
                      setDragOverGroup(null);
                      setDraggedCatId(null);
                      if (droppedCatId) {
                        await handleMoveCategoryToGroup(droppedCatId, group);
                      }
                    }}
                    className={`space-y-3 p-3 rounded-2xl transition-all duration-200 ${
                      isDropTarget
                        ? 'border-2 border-dashed border-neon bg-neon/10 shadow-neon-sm scale-[1.01]'
                        : 'border border-transparent'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{meta.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white tracking-tight">
                              {group}
                            </h3>
                            <button
                              type="button"
                              onClick={() => setEditingGroup(group)}
                              title="Renomear título desta gaveta"
                              className="p-1 rounded-md text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-graphite-400 font-mono">
                              ({cats.length} {cats.length === 1 ? 'conta' : 'contas'})
                            </span>
                          </div>
                          <p className="text-[11px] text-graphite-400">{meta.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-graphite-400 shrink-0">
                        <span>
                          Teto da Gaveta:{' '}
                          <strong className="text-white">{formatCurrency(groupLimit)}</strong>
                        </span>
                        <span>
                          Gasto:{' '}
                          <strong className={groupPct >= 100 ? 'text-expense' : 'text-neon'}>
                            {formatCurrency(groupSpent)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Banner Informativo Drop Zone (Kanban) */}
                    {isDropTarget && (
                      <div className="py-2.5 px-4 rounded-xl bg-neon/20 border border-neon/50 text-neon font-bold text-xs flex items-center justify-center gap-2 animate-pulse">
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Solte o card aqui para mover para a gaveta "{group}"</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {cats.map((cat) => {
                        const isIncome = natureTab === 'income';
                const limit = parseFloat(String(cat.budget_limit)) || 0;
                const IconComponent = ICON_MAP[cat.icon] || Layers;

                if (isIncome) {
                  // Calcular quanto já foi recebido para esta categoria de receita
                  const received = transactions
                    .filter(
                      (t) =>
                        t.type === 'income' &&
                        (t.category_id === cat.id ||
                          t.category?.name?.toLowerCase() === cat.name?.toLowerCase())
                    )
                    .reduce((sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0);

                  const pct = limit > 0 ? (received / limit) * 100 : 0;
                  const isAchieved = pct >= 100;
                  const isBeingDragged = draggedCatId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', cat.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedCatId(cat.id);
                      }}
                      onDragEnd={() => {
                        setDraggedCatId(null);
                        setDragOverGroup(null);
                      }}
                      className={`bg-surface border rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all group relative overflow-hidden cursor-grab active:cursor-grabbing select-none ${
                        isBeingDragged
                          ? 'opacity-40 border-neon scale-95 shadow-neon-sm'
                          : 'border-border'
                      }`}
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                              style={{
                                backgroundColor: `${cat.color || '#10B981'}20`,
                                color: cat.color || '#10B981',
                              }}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span title="Arraste para mover para outra gaveta">
                              <GripVertical className="w-3.5 h-3.5 text-graphite-600 group-hover:text-graphite-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                                cat.category_type === 'fixed'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {cat.category_type === 'fixed' ? 'Entrada Fixa' : 'Freelance / Outros'}
                            </span>

                            <button
                              type="button"
                              onClick={() => setMovingCategoryTarget(cat)}
                              title="Mover de gaveta"
                              className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

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
                          <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-graphite-400 font-mono mt-1 pt-0.5">
                            <span className="text-graphite-300">
                              {cat.category_type === 'fixed' ? 'Salário Líquido: ' : 'Meta: '}
                              <strong className="text-white font-mono">{formatCurrency(limit)}</strong>
                            </span>
                            {cat.due_day && (
                              <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-sans font-medium shrink-0">
                                Cai dia {cat.due_day}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/70 space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-graphite-400">Recebido: {formatCurrency(received)}</span>
                          <span
                            className={
                              isAchieved
                                ? 'text-emerald-400 font-bold'
                                : pct > 0
                                ? 'text-neon font-semibold'
                                : 'text-graphite-500'
                            }
                          >
                            {pct.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-1.5 w-full bg-graphite-900 rounded-full overflow-hidden border border-border/50">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isAchieved ? 'bg-emerald-400 shadow-sm' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>

                        {/* Botão de Confirmação Rápida de Salário */}
                        {cat.category_type === 'fixed' && limit > 0 && !isAchieved && (
                          <button
                            type="button"
                            onClick={async () => {
                              const now = new Date();
                              const year = now.getFullYear();
                              const month = String(now.getMonth() + 1).padStart(2, '0');
                              const dayStr = cat.due_day
                                ? String(Math.min(cat.due_day, 28)).padStart(2, '0')
                                : '05';
                              await fetch('/api/finance/transactions', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  type: 'income',
                                  amount: limit,
                                  description: cat.name,
                                  category_id: cat.id,
                                  date: `${year}-${month}-${dayStr}`,
                                  entry_subtype: 'fixed',
                                  status: 'completed',
                                  payment_method: 'transferencia',
                                }),
                              });
                              refreshData();
                            }}
                            className="w-full mt-2 py-1.5 px-2 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Confirmar Salário no Caixa</span>
                          </button>
                        )}

                        {cat.category_type === 'fixed' && limit > 0 && isAchieved && (
                          <div className="w-full mt-2 py-1 px-2 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Salário deste mês lançado no caixa</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => openCategoryTransactionsModal(cat)}
                          className="w-full mt-2 py-1.5 px-2.5 text-xs font-medium text-graphite-300 hover:text-emerald-300 bg-graphite-900/80 hover:bg-graphite-800 border border-border/80 hover:border-emerald-500/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ver Entradas & Lançamentos</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Renderização para Despesas
                const budgetItem = budgets.find((b) => b.category_name === cat.name);
                const spent = budgetItem ? parseFloat(String(budgetItem.actual_spent)) || 0 : 0;
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
                const isBeingDragged = draggedCatId === cat.id;

                return (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', cat.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggedCatId(cat.id);
                    }}
                    onDragEnd={() => {
                      setDraggedCatId(null);
                      setDragOverGroup(null);
                    }}
                    className={`bg-surface border rounded-xl p-4 flex flex-col justify-between hover:border-graphite-600 transition-all group relative overflow-hidden cursor-grab active:cursor-grabbing select-none ${
                      isBeingDragged
                        ? 'opacity-40 border-neon scale-95 shadow-neon-sm'
                        : 'border-border'
                    }`}
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: `${cat.color || '#A3E635'}20`,
                              color: cat.color || '#A3E635',
                            }}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span title="Arraste para mover para outra gaveta">
                            <GripVertical className="w-3.5 h-3.5 text-graphite-600 group-hover:text-graphite-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </span>
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
                            type="button"
                            onClick={() => setMovingCategoryTarget(cat)}
                            title="Mover de gaveta"
                            className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

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
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-graphite-400 font-mono mt-1 pt-0.5">
                          <span className="text-graphite-300">
                            Teto: <strong className="text-white font-mono">{formatCurrency(limit)}</strong>
                          </span>
                          {cat.category_type === 'fixed' && (
                            <span className="text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded font-sans font-medium shrink-0">
                              Vence dia {cat.due_day || 10}
                            </span>
                          )}
                          {cat.category_type === 'credit_card' && (
                            <span className="text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded font-sans font-medium shrink-0">
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

                      {/* Botão de Ação Direta: Marcar como Pago / Registrar Despesa */}
                      {spent > 0 ? (
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex-1 py-1.5 px-2 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate">Pago: {formatCurrency(spent)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPayingCategory(cat)}
                            title="Registrar outro pagamento nesta conta"
                            className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-white bg-graphite-900 hover:bg-graphite-800 border border-border/80 hover:border-emerald-500/50 transition-colors flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Pagar</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPayingCategory(cat)}
                          className="w-full mt-2 py-2 px-3 text-xs font-bold text-graphite-950 bg-neon hover:bg-neon/90 rounded-lg shadow-neon-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Marcar como Pago</span>
                        </button>
                      )}

                      {/* Botão para Extrato de Compras Detalhado (Ex: Compras da Feira, Mercado, Contas) */}
                      <button
                        type="button"
                        onClick={() => openCategoryTransactionsModal(cat)}
                        className="w-full mt-1.5 py-1.5 px-2.5 text-xs font-medium text-graphite-300 hover:text-white bg-graphite-900/80 hover:bg-graphite-800 border border-border/80 hover:border-neon/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 text-neon" />
                        <span>Extrato de Compras & Pagamentos</span>
                      </button>
                    </div>
                  </div>
                );
              })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Tabela Comparativa Detalhada */}
      {natureTab === 'expense' && (
        <BudgetProgress limit={0} showAddButton={false} />
      )}

      {/* Modal de Renomear Gaveta Orçamentária */}
      <EditGroupModal
        isOpen={Boolean(editingGroup)}
        onClose={() => setEditingGroup(null)}
        currentGroupName={editingGroup || ''}
      />

      {/* Modal de Pagamento Rápido de Despesa */}
      <QuickExpenseModal
        isOpen={Boolean(payingCategory)}
        onClose={() => setPayingCategory(null)}
        category={payingCategory}
      />

      {/* Mini-Modal de Mover Categoria para Outra Gaveta (Kanban / Touch) */}
      {movingCategoryTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-neon" />
                <h4 className="text-sm font-bold text-white">Mover de Gaveta (Kanban)</h4>
              </div>
              <button
                type="button"
                onClick={() => setMovingCategoryTarget(null)}
                className="text-graphite-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs text-graphite-300 mb-2.5">
                Escolha a nova gaveta de <strong>{movingCategoryTarget.name}</strong>:
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {GROUP_ORDER.filter((g) => g !== 'Fontes de Renda').map((targetG) => {
                  const isCurrent = movingCategoryTarget.group_name === targetG;
                  const meta = getGroupMeta(targetG);
                  return (
                    <button
                      key={targetG}
                      type="button"
                      disabled={isCurrent || isMovingCategory}
                      onClick={async () => {
                        await handleMoveCategoryToGroup(movingCategoryTarget.id, targetG);
                        setMovingCategoryTarget(null);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'border-neon/40 bg-neon/10 text-white font-semibold cursor-default'
                          : 'border-border bg-graphite-900/60 text-graphite-300 hover:text-white hover:bg-graphite-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{meta.icon}</span>
                        <span>{targetG}</span>
                      </span>
                      {isCurrent && <span className="text-[10px] text-neon">Atual</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
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
