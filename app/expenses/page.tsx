'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Folder,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDateBR } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { ICON_MAP } from '@/components/dashboard/CategoryModal';
import { EditGroupModal } from '@/components/dashboard/EditGroupModal';
import type { Transaction, Category } from '@/types/database.types';

const GROUP_ORDER = [
  'Moradia & Habitação',
  'Alimentação & Abastecimento',
  'Transporte & Mobilidade',
  'Cartões & Parcelamentos',
  'Família, Saúde & Educação',
  'Estilo de Vida & Lazer',
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

function ExpensesContent() {
  const {
    transactions,
    categories,
    budgets,
    installments,
    deleteTransaction,
    openEditTransactionModal,
    openNewTransactionModal,
    openCategoryTransactionsModal,
    openCategoryModal,
    openInstallmentsModal,
    toggleTransactionStatus,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'by_category' | 'all' | 'pending'>('by_category');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [updatingTxId, setUpdatingTxId] = useState<string | null>(null);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  // Filtrar apenas despesas (type === 'expense')
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense');
  }, [transactions]);

  // Categorias de despesa
  const expenseCategories = useMemo(() => {
    return categories.filter((c) => c.category_nature !== 'income');
  }, [categories]);

  // Agrupamento estruturado das categorias em "Gavetas"
  const groupedExpenseCategories = useMemo(() => {
    const groups: Record<string, Category[]> = {};

    // Inicializar grupos na ordem padrão
    GROUP_ORDER.forEach((g) => {
      groups[g] = [];
    });

    expenseCategories.forEach((cat) => {
      const g = cat.group_name || 'Outros';
      if (!groups[g]) groups[g] = [];
      groups[g].push(cat);
    });

    // Retorna apenas grupos que possuem categorias cadastradas
    return Object.entries(groups).filter(([_, cats]) => cats.length > 0);
  }, [expenseCategories]);

  // KPIs
  const totalExpenses = useMemo(() => {
    return expenseTransactions.reduce((acc, t) => acc + (parseFloat(String(t.amount)) || 0), 0);
  }, [expenseTransactions]);

  const totalPaid = useMemo(() => {
    return expenseTransactions
      .filter((t) => t.status === 'completed')
      .reduce((acc, t) => acc + (parseFloat(String(t.amount)) || 0), 0);
  }, [expenseTransactions]);

  const totalPending = useMemo(() => {
    return expenseTransactions
      .filter((t) => t.status === 'pending')
      .reduce((acc, t) => acc + (parseFloat(String(t.amount)) || 0), 0);
  }, [expenseTransactions]);

  const totalBudgetLimit = useMemo(() => {
    return expenseCategories.reduce((acc, c) => acc + (parseFloat(String(c.budget_limit)) || 0), 0);
  }, [expenseCategories]);

  const budgetUsagePercent = totalBudgetLimit > 0 ? (totalExpenses / totalBudgetLimit) * 100 : 0;

  // Filtragem de transações para lista geral / avulsa
  const filteredTransactions = useMemo(() => {
    return expenseTransactions.filter((tx) => {
      // Filtro de aba Pendentes
      if (activeTab === 'pending' && tx.status !== 'pending') return false;

      // Filtro de status se estiver na aba Geral
      if (activeTab === 'all' && statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }

      // Filtro de Gaveta / Grupo
      if (selectedGroupFilter !== 'all') {
        const cat = categories.find((c) => c.id === tx.category_id);
        const group = cat?.group_name || 'Outros';
        if (group !== selectedGroupFilter) return false;
      }

      // Filtro de categoria
      if (selectedCategoryFilter !== 'all' && tx.category_id !== selectedCategoryFilter) {
        return false;
      }

      // Filtro de forma de pagamento
      if (
        paymentMethodFilter !== 'all' &&
        tx.payment_method?.toLowerCase() !== paymentMethodFilter.toLowerCase()
      ) {
        return false;
      }

      // Filtro de busca textual
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = tx.description?.toLowerCase().includes(query);
        const matchesCat = tx.category?.name?.toLowerCase().includes(query);
        const matchesMethod = tx.payment_method?.toLowerCase().includes(query);
        const matchesPix = tx.pix_key?.toLowerCase().includes(query);
        return matchesDesc || matchesCat || matchesMethod || matchesPix;
      }

      return true;
    });
  }, [
    expenseTransactions,
    categories,
    activeTab,
    statusFilter,
    selectedGroupFilter,
    selectedCategoryFilter,
    paymentMethodFilter,
    searchQuery,
  ]);

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const handleCopyPix = (pix: string, id: string) => {
    navigator.clipboard.writeText(pix);
    setCopiedPixId(id);
    setTimeout(() => setCopiedPixId(null), 2000);
  };

  const handleToggleStatus = async (tx: Transaction) => {
    setUpdatingTxId(tx.id);
    const nextStatus = tx.status === 'completed' ? 'pending' : 'completed';
    await toggleTransactionStatus(tx.id, nextStatus);
    setUpdatingTxId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-expense-muted border border-expense/30 flex items-center justify-center text-expense">
              <Receipt className="h-4 w-4" />
            </div>
            Despesas do Mês & Gavetas Patrimoniais
          </h2>
          <p className="text-xs text-graphite-400 mt-1">
            Centros de custo organizados por gavetas: Moradia, Alimentação, Transporte, Cartões, Família e Lazer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => openCategoryModal(null)}
            variant="secondary"
            className="text-xs border-border flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Nova Conta</span>
          </Button>

          <Button
            onClick={() => openNewTransactionModal()}
            className="bg-neon hover:bg-neon-muted text-graphite-950 font-semibold text-xs shadow-neon-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ Lançar Saída</span>
          </Button>
        </div>
      </div>

      {/* KPIs Rápidos de Despesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Despesas */}
        <Card className="bg-surface border-border p-4">
          <div className="flex items-center justify-between text-xs text-graphite-400 mb-1">
            <span>Total de Saídas no Mês</span>
            <Receipt className="w-4 h-4 text-expense" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-[11px] text-graphite-400 mt-1">
            {expenseTransactions.length} lançamentos discriminados
          </p>
        </Card>

        {/* Já Pagas */}
        <Card className="bg-surface border-border p-4">
          <div className="flex items-center justify-between text-xs text-graphite-400 mb-1">
            <span>Saídas Já Liquidadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-[11px] text-graphite-400 mt-1">
            Baixadas com sucesso no caixa
          </p>
        </Card>

        {/* Pendentes */}
        <Card className="bg-surface border-border p-4">
          <div className="flex items-center justify-between text-xs text-graphite-400 mb-1">
            <span>A Liquidar / Pendentes</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {formatCurrency(totalPending)}
          </div>
          <p className="text-[11px] text-graphite-400 mt-1">
            Aguardando confirmação de saída
          </p>
        </Card>

        {/* Orçamento vs Realizado */}
        <Card className="bg-surface border-border p-4">
          <div className="flex items-center justify-between text-xs text-graphite-400 mb-1">
            <span>Teto Total Previsto</span>
            <span
              className={`text-[10px] font-bold font-mono ${
                budgetUsagePercent >= 100
                  ? 'text-expense'
                  : budgetUsagePercent >= 80
                  ? 'text-amber-400'
                  : 'text-neon'
              }`}
            >
              {budgetUsagePercent.toFixed(0)}%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatCurrency(totalBudgetLimit)}
          </div>
          <div className="h-1.5 w-full bg-graphite-900 rounded-full overflow-hidden mt-2 border border-border/50">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetUsagePercent >= 100
                  ? 'bg-expense'
                  : budgetUsagePercent >= 80
                  ? 'bg-amber-400'
                  : 'bg-neon'
              }`}
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Seletor de Abas da Página */}
      <div className="flex items-center gap-2 border-b border-border pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('by_category')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'by_category'
              ? 'bg-neon text-graphite-950 shadow-neon-sm'
              : 'bg-graphite-900/80 text-graphite-400 hover:text-white border border-border'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Gavetas & Contas ({expenseCategories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-neon text-graphite-950 shadow-neon-sm'
              : 'bg-graphite-900/80 text-graphite-400 hover:text-white border border-border'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Extrato Geral & Compras Avulsas ({expenseTransactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-400 text-graphite-950 shadow-sm'
              : 'bg-graphite-900/80 text-graphite-400 hover:text-white border border-border'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>
            Pendentes a Pagar (
            {expenseTransactions.filter((t) => t.status === 'pending').length})
          </span>
        </button>
      </div>

      {/* ABA 1: Visão Estruturada por GAVETAS PATRIMONIAIS */}
      {activeTab === 'by_category' && (
        <div className="space-y-6">
          {/* Chips de Atalho de Gaveta */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-graphite-400 font-medium shrink-0">
              Filtrar Gaveta:
            </span>
            <button
              type="button"
              onClick={() => setSelectedGroupFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedGroupFilter === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-graphite-900 text-graphite-400 hover:text-white border border-border'
              }`}
            >
              Todas as Gavetas ({expenseCategories.length})
            </button>
            {groupedExpenseCategories.map(([group, cats]) => {
              const meta = getGroupMeta(group);
              const isSelected = selectedGroupFilter === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroupFilter(isSelected ? 'all' : group)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-white text-black font-semibold border-white'
                      : 'bg-graphite-900 text-graphite-300 hover:text-white border-border'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{group}</span>
                  <span className="text-[10px] opacity-75">({cats.length})</span>
                </button>
              );
            })}
          </div>

          {/* Renderização de Cada Gaveta (Macro-Grupo) */}
          {groupedExpenseCategories
            .filter(([group]) => selectedGroupFilter === 'all' || selectedGroupFilter === group)
            .map(([group, cats]) => {
              const meta = getGroupMeta(group);
              const isCollapsed = Boolean(collapsedGroups[group]);

              // Total do Grupo
              const groupLimit = cats.reduce(
                (sum, c) => sum + (parseFloat(String(c.budget_limit)) || 0),
                0
              );

              const groupSpent = cats.reduce((sum, c) => {
                const b = budgets.find((item) => item.category_name === c.name);
                return sum + (b ? parseFloat(String(b.actual_spent)) || 0 : 0);
              }, 0);

              const groupRemaining = Math.max(groupLimit - groupSpent, 0);
              const groupPct = groupLimit > 0 ? (groupSpent / groupLimit) * 100 : 0;
              const isGroupOver = groupPct >= 100;
              const isGroupWarning = groupPct >= 80;

              return (
                <div
                  key={group}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 transition-all"
                >
                  {/* Cabeçalho da Gaveta */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/70 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm border border-border"
                        style={{ backgroundColor: `${meta.color}15` }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white tracking-tight">
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
                          <Badge variant="neutral" className="text-[10px] font-mono">
                            {cats.length} {cats.length === 1 ? 'subconta' : 'subcontas'}
                          </Badge>
                        </div>
                        <p className="text-xs text-graphite-400 mt-0.5">{meta.desc}</p>
                      </div>
                    </div>

                    {/* KPIs Consolidados da Gaveta */}
                    <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                      <div>
                        <span className="text-graphite-400 text-[10px] block font-sans">
                          Teto da Gaveta
                        </span>
                        <span className="text-white font-bold">
                          {formatCurrency(groupLimit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-graphite-400 text-[10px] block font-sans">
                          Total Gasto
                        </span>
                        <span
                          className={`font-bold ${
                            isGroupOver
                              ? 'text-expense'
                              : isGroupWarning
                              ? 'text-amber-400'
                              : 'text-white'
                          }`}
                        >
                          {formatCurrency(groupSpent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-graphite-400 text-[10px] block font-sans">
                          {isGroupOver ? 'Estouro' : 'Disponível'}
                        </span>
                        <span
                          className={`font-bold ${
                            isGroupOver ? 'text-expense' : 'text-emerald-400'
                          }`}
                        >
                          {isGroupOver
                            ? `-${formatCurrency(groupSpent - groupLimit)}`
                            : formatCurrency(groupRemaining)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleGroupCollapse(group)}
                        className="p-1.5 rounded-lg bg-graphite-900 hover:bg-graphite-800 text-graphite-400 hover:text-white border border-border transition-colors ml-1"
                        title={isCollapsed ? 'Abrir gaveta' : 'Recolher gaveta'}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progresso Global do Grupo */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-graphite-400">
                      <span>Consumo do Teto da Gaveta</span>
                      <span
                        className={
                          isGroupOver
                            ? 'text-expense font-bold'
                            : isGroupWarning
                            ? 'text-amber-400 font-semibold'
                            : 'text-neon font-medium'
                        }
                      >
                        {groupPct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-graphite-900 rounded-full overflow-hidden border border-border/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isGroupOver
                            ? 'bg-expense'
                            : isGroupWarning
                            ? 'bg-amber-400'
                            : 'bg-neon'
                        }`}
                        style={{ width: `${Math.min(groupPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Lista de Contas / Subcategorias dentro desta Gaveta */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                      {cats.map((cat) => {
                        const IconComp = ICON_MAP[cat.icon || 'Tag'] || ShoppingBag;
                        const limit = parseFloat(String(cat.budget_limit)) || 0;
                        const budgetItem = budgets.find((b) => b.category_name === cat.name);
                        const spent = budgetItem
                          ? parseFloat(String(budgetItem.actual_spent)) || 0
                          : 0;
                        const remaining = Math.max(limit - spent, 0);
                        const pct = limit > 0 ? (spent / limit) * 100 : 0;
                        const isOver = pct >= 100;
                        const isWarning = pct >= 80;

                        // Transações específicas desta categoria no mês
                        const catTxs = expenseTransactions.filter(
                          (t) => t.category_id === cat.id
                        );
                        const isExpanded = Boolean(expandedCategories[cat.id]);

                        // Parcelas ativas vinculadas a esta categoria
                        const catInstallments = installments.filter(
                          (i) => i.category_id === cat.id && i.status === 'active'
                        );

                        return (
                          <div
                            key={cat.id}
                            className="bg-graphite-900/70 border border-border/80 hover:border-graphite-600 rounded-xl p-3.5 transition-all flex flex-col justify-between group"
                          >
                            <div>
                              {/* Topo do Card da Subconta */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                      backgroundColor: `${cat.color || meta.color}20`,
                                      color: cat.color || meta.color,
                                    }}
                                  >
                                    <IconComp className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-white truncate max-w-[140px]">
                                      {cat.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[10px] text-graphite-400 mt-0.5">
                                      <span
                                        className={`px-1.5 py-0.2 rounded font-medium border ${
                                          cat.category_type === 'fixed'
                                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/25'
                                            : cat.category_type === 'credit_card'
                                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/25'
                                            : 'bg-graphite-800 text-graphite-400 border-border'
                                        }`}
                                      >
                                        {cat.category_type === 'fixed'
                                          ? 'Fixo Mensal'
                                          : cat.category_type === 'credit_card'
                                          ? 'Cartão / Parcelas'
                                          : 'Variável'}
                                      </span>

                                      {cat.due_day && (
                                        <span className="text-blue-300 font-mono">
                                          Vence dia {cat.due_day}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openCategoryModal(cat)}
                                  className="p-1 rounded text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                                  title="Editar conta"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Teto e Gasto */}
                              <div className="mt-3 flex items-center justify-between text-xs font-mono">
                                <span className="text-graphite-400">
                                  Teto: {formatCurrency(limit)}
                                </span>
                                <span
                                  className={
                                    isOver
                                      ? 'text-expense font-bold'
                                      : isWarning
                                      ? 'text-amber-400 font-semibold'
                                      : 'text-white'
                                  }
                                >
                                  Gasto: {formatCurrency(spent)}
                                </span>
                              </div>

                              {/* Mini Barra de Progresso */}
                              <div className="h-1.5 w-full bg-graphite-950 rounded-full overflow-hidden mt-1.5 border border-border/40">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isOver
                                      ? 'bg-expense'
                                      : isWarning
                                      ? 'bg-amber-400'
                                      : 'bg-neon'
                                  }`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-graphite-400 mt-1">
                                <span>
                                  {isOver
                                    ? `Estouro: ${formatCurrency(spent - limit)}`
                                    : `Resta: ${formatCurrency(remaining)}`}
                                </span>
                                <span>{catTxs.length} compras</span>
                              </div>

                              {/* Chave Pix (se houver) */}
                              {cat.pix_key && (
                                <div className="mt-2 p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between text-[10px]">
                                  <span className="text-purple-300 font-mono truncate max-w-[120px]">
                                    Pix: {cat.pix_key}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPix(cat.pix_key!, cat.id)}
                                    className="text-purple-300 hover:text-white flex items-center gap-1 shrink-0"
                                  >
                                    {copiedPixId === cat.id ? (
                                      <>
                                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                                        <span>Copiado</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-2.5 h-2.5" />
                                        <span>Copiar</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* Bloco de Parcelas para Cartões */}
                              {catInstallments.length > 0 && (
                                <div className="mt-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/25 text-[10px]">
                                  <div className="flex items-center justify-between text-purple-300 font-semibold mb-1">
                                    <span>{catInstallments.length} compras parceladas</span>
                                    <button
                                      type="button"
                                      onClick={() => openInstallmentsModal(cat)}
                                      className="text-neon hover:underline"
                                    >
                                      Ver &gt;
                                    </button>
                                  </div>
                                  <div className="space-y-0.5 text-graphite-400 font-mono">
                                    {catInstallments.slice(0, 2).map((inst) => (
                                      <div
                                        key={inst.id}
                                        className="flex items-center justify-between"
                                      >
                                        <span className="truncate pr-1">
                                          {inst.description} ({inst.current_installment}/
                                          {inst.total_installments})
                                        </span>
                                        <span className="text-white shrink-0">
                                          {formatCurrency(Number(inst.installment_amount))}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Ações da Subconta */}
                            <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => openCategoryTransactionsModal(cat)}
                                className="flex-1 text-[11px] h-7 text-graphite-300 hover:text-white bg-graphite-950 hover:bg-graphite-800 border border-border"
                              >
                                <Receipt className="w-3 h-3 mr-1 text-neon" />
                                <span>Ver Extrato</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                onClick={() => toggleCategoryExpand(cat.id)}
                                className="h-7 px-2 text-[11px] bg-graphite-950 hover:bg-graphite-800 text-graphite-400 hover:text-white border border-border"
                                title={isExpanded ? 'Recolher compras' : 'Expandir compras'}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </Button>
                            </div>

                            {/* Sub-lista expansível de compras */}
                            {isExpanded && (
                              <div className="mt-2 pt-2 border-t border-border/40 space-y-1 animate-in fade-in duration-200">
                                {catTxs.length === 0 ? (
                                  <p className="text-[10px] text-graphite-400 text-center py-1">
                                    Nenhuma compra este mês.
                                  </p>
                                ) : (
                                  catTxs.map((subTx) => (
                                    <div
                                      key={subTx.id}
                                      className="p-1.5 bg-graphite-950/80 rounded-md flex items-center justify-between text-[11px]"
                                    >
                                      <div className="truncate pr-1">
                                        <p className="font-medium text-white truncate text-[11px]">
                                          {subTx.description}
                                        </p>
                                        <p className="text-[9px] text-graphite-400 font-mono">
                                          {formatDateBR(subTx.date)}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="font-mono font-semibold text-white text-[11px]">
                                          {formatCurrency(Number(subTx.amount))}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => openEditTransactionModal(subTx)}
                                          title="Editar"
                                          className="p-0.5 rounded text-graphite-400 hover:text-white"
                                        >
                                          <Pencil className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (
                                              window.confirm(
                                                `Excluir "${subTx.description}"?`
                                              )
                                            ) {
                                              await deleteTransaction(subTx.id);
                                            }
                                          }}
                                          title="Excluir"
                                          className="p-0.5 rounded text-graphite-400 hover:text-expense"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* ABA 2 & ABA 3: Extrato Geral de Saídas / Compras Avulsas / Pendentes */}
      {(activeTab === 'all' || activeTab === 'pending') && (
        <div className="space-y-4">
          {/* Barra de Filtros e Pesquisa */}
          <div className="bg-surface border border-border rounded-xl p-3 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-graphite-400" />
              <input
                type="text"
                placeholder="Pesquisar por descrição, mercado, feira, chave pix..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon font-sans"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Filtro por Gaveta */}
              <select
                value={selectedGroupFilter}
                onChange={(e) => {
                  setSelectedGroupFilter(e.target.value);
                  setSelectedCategoryFilter('all');
                }}
                className="px-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon"
              >
                <option value="all">Todas as Gavetas</option>
                {GROUP_ORDER.map((g) => (
                  <option key={g} value={g}>
                    {GROUP_METADATA[g]?.icon || '📦'} {g}
                  </option>
                ))}
              </select>

              {/* Filtro por Categoria */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon"
              >
                <option value="all">Todas as Contas</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Filtro por Status (apenas se aba 'all') */}
              {activeTab === 'all' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon"
                >
                  <option value="all">Status: Todos</option>
                  <option value="completed">Apenas Pagas</option>
                  <option value="pending">Apenas Pendentes</option>
                </select>
              )}

              {/* Filtro por Método de Pagamento */}
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon"
              >
                <option value="all">Forma de Pagamento</option>
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          {/* Listagem de Saídas */}
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center bg-surface border border-dashed border-border rounded-2xl p-8 space-y-3">
              <Receipt className="w-10 h-10 text-graphite-500 mx-auto" />
              <h3 className="text-sm font-semibold text-white">
                Nenhuma despesa encontrada com estes filtros
              </h3>
              <p className="text-xs text-graphite-400 max-w-sm mx-auto">
                Tente alterar os filtros de busca ou lance uma nova saída clicando no botão abaixo.
              </p>
              <Button
                onClick={() => openNewTransactionModal()}
                className="bg-neon hover:bg-neon-muted text-graphite-950 font-semibold text-xs mt-2"
              >
                + Nova Despesa
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => {
                const isPaid = tx.status === 'completed';
                const isPending = tx.status === 'pending';
                const cat = categories.find((c) => c.id === tx.category_id);
                const groupName = cat?.group_name || 'Outros';
                const groupMeta = GROUP_METADATA[groupName] || GROUP_METADATA['Outros'];
                const catColor = cat?.color || groupMeta.color || '#A3E635';

                return (
                  <div
                    key={tx.id}
                    className="bg-surface border border-border hover:border-graphite-600 rounded-xl p-3.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    {/* Lado Esquerdo: Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${catColor}20`,
                          color: catColor,
                        }}
                      >
                        <Receipt className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white truncate">
                            {tx.description}
                          </span>

                          {/* Badge da Gaveta */}
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-graphite-900 border border-border text-graphite-300 flex items-center gap-1">
                            <span>{groupMeta.icon}</span>
                            <span>{groupName}</span>
                          </span>

                          {/* Badge da Subconta */}
                          {cat?.name && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                              style={{
                                backgroundColor: `${catColor}15`,
                                borderColor: `${catColor}30`,
                                color: catColor,
                              }}
                            >
                              {cat.name}
                            </span>
                          )}

                          {tx.entry_subtype === 'fixed' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/25">
                              Custo Fixo
                            </span>
                          )}
                          {tx.entry_subtype === 'credit_card' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/25">
                              Cartão
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 text-[11px] text-graphite-400 mt-1 flex-wrap font-mono">
                          <span>{formatDateBR(tx.date)}</span>
                          <span>•</span>
                          <span className="text-graphite-300 flex items-center gap-1 font-sans">
                            <CreditCard className="w-3 h-3 text-graphite-400" />
                            {tx.payment_method || 'Pix'}
                          </span>

                          {tx.pix_key && (
                            <div className="flex items-center gap-1 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] text-purple-300">
                              <QrCode className="w-3 h-3" />
                              <span>Pix: {tx.pix_key}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyPix(tx.pix_key!, tx.id)}
                                className="ml-1 hover:text-white"
                                title="Copiar Pix"
                              >
                                {copiedPixId === tx.id ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          )}

                          {tx.payment_info && (
                            <span className="text-[10px] text-graphite-400 truncate max-w-xs">
                              Ref: {tx.payment_info}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Valor & Ações */}
                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                      {/* Botão de Status / Confirmação */}
                      <button
                        type="button"
                        disabled={updatingTxId === tx.id}
                        onClick={() => handleToggleStatus(tx)}
                        title={
                          isPaid
                            ? 'Clique para marcar como Pendente'
                            : 'Clique para Confirmar Saída no Caixa'
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border shrink-0 ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
                            : 'bg-graphite-800 text-graphite-400 border-border'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Pago</span>
                          </>
                        ) : isPending ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Confirmar Saída</span>
                          </>
                        ) : (
                          <span>Cancelado</span>
                        )}
                      </button>

                      {/* Valor */}
                      <span className="text-sm font-bold font-mono text-white text-right min-w-[90px]">
                        - {formatCurrency(Number(tx.amount))}
                      </span>

                      {/* Ações: Editar e Excluir */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEditTransactionModal(tx)}
                          title="Editar lançamento"
                          className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = window.confirm(
                              `Deseja realmente excluir a despesa "${tx.description}"?`
                            );
                            if (ok) await deleteTransaction(tx.id);
                          }}
                          title="Excluir lançamento"
                          className="p-1.5 rounded-lg text-graphite-400 hover:text-expense hover:bg-expense/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal para Renomear Gaveta Orçamentária */}
      <EditGroupModal
        isOpen={Boolean(editingGroup)}
        onClose={() => setEditingGroup(null)}
        currentGroupName={editingGroup || ''}
      />
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <DashboardLayout>
      <ExpensesContent />
    </DashboardLayout>
  );
}
