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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDateBR } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { ICON_MAP } from '@/components/dashboard/CategoryModal';
import type { Transaction, Category } from '@/types/database.types';

function ExpensesContent() {
  const {
    transactions,
    categories,
    budgets,
    deleteTransaction,
    openEditTransactionModal,
    openNewTransactionModal,
    openCategoryTransactionsModal,
    toggleTransactionStatus,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'by_category' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [updatingTxId, setUpdatingTxId] = useState<string | null>(null);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  // Filtrar apenas despesas (type === 'expense')
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense');
  }, [transactions]);

  // Categorias de despesa
  const expenseCategories = useMemo(() => {
    return categories.filter((c) => c.category_nature !== 'income');
  }, [categories]);

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
    activeTab,
    statusFilter,
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
              Despesas do Mês
            </h2>
            <p className="text-xs text-graphite-400 mt-1">
              Gerencie todas as saídas mensais, gastos avulsos, tetos por categoria e confirmação de pagamentos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => openNewTransactionModal()}
              className="bg-neon hover:bg-neon-muted text-graphite-950 font-semibold text-xs shadow-neon-sm flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>+ Nova Despesa</span>
            </Button>
          </div>
        </div>

        {/* KPIs de Despesas */}
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
              {expenseTransactions.length} lançamentos registrados
            </p>
          </Card>

          {/* Já Pagas */}
          <Card className="bg-surface border-border p-4">
            <div className="flex items-center justify-between text-xs text-graphite-400 mb-1">
              <span>Saídas Já Pagas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-[11px] text-graphite-400 mt-1">
              Liquidadas no caixa
            </p>
          </Card>

          {/* Pendentes */}
          <Card className="bg-surface border-border p-4">
            <div className="flex items-center justify-between text-xs text-graphite-400 mb-1">
              <span>A Pagar / Pendentes</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-[11px] text-graphite-400 mt-1">
              Aguardando confirmação
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
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-neon text-graphite-950 shadow-neon-sm'
                : 'bg-graphite-900/80 text-graphite-400 hover:text-white border border-border'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Todas as Saídas & Avulsas ({expenseTransactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('by_category')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'by_category'
                ? 'bg-neon text-graphite-950 shadow-neon-sm'
                : 'bg-graphite-900/80 text-graphite-400 hover:text-white border border-border'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Por Categoria & Tetos ({expenseCategories.length})</span>
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

        {/* ABA 1 & ABA 3: Lista Completa / Compras Avulsas / Pendentes */}
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
                {/* Filtro por Categoria */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon"
                >
                  <option value="all">Todas as Categorias</option>
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
                  const catColor = tx.category?.color || '#A3E635';

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

                            {tx.category?.name && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                                style={{
                                  backgroundColor: `${catColor}15`,
                                  borderColor: `${catColor}30`,
                                  color: catColor,
                                }}
                              >
                                {tx.category.name}
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

        {/* ABA 2: Visão Agrupada por Categoria & Tetos */}
        {activeTab === 'by_category' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenseCategories.map((cat) => {
                const IconComp = ICON_MAP[cat.icon || 'Tag'] || ShoppingBag;
                const limit = parseFloat(String(cat.budget_limit)) || 0;
                const budgetItem = budgets.find((b) => b.category_name === cat.name);
                const spent = budgetItem ? parseFloat(String(budgetItem.actual_spent)) || 0 : 0;
                const remaining = Math.max(limit - spent, 0);
                const pct = limit > 0 ? (spent / limit) * 100 : 0;
                const isOver = pct >= 100;
                const isWarning = pct >= 80;

                // Transações específicas desta categoria no mês
                const catTxs = expenseTransactions.filter((t) => t.category_id === cat.id);
                const isExpanded = Boolean(expandedCategories[cat.id]);

                return (
                  <div
                    key={cat.id}
                    className="bg-surface border border-border hover:border-graphite-600 rounded-xl p-4 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${cat.color || '#A3E635'}20`,
                              color: cat.color || '#A3E635',
                            }}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              {cat.name}
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
                            </h4>
                            <p className="text-xs text-graphite-400 font-mono mt-0.5">
                              Teto: {formatCurrency(limit)} • Gasto: {formatCurrency(spent)}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold font-mono ${
                            isOver ? 'text-expense' : isWarning ? 'text-amber-400' : 'text-neon'
                          }`}
                        >
                          {pct.toFixed(0)}%
                        </span>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="h-1.5 w-full bg-graphite-900 rounded-full overflow-hidden mt-3 border border-border/50">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver ? 'bg-expense' : isWarning ? 'bg-amber-400' : 'bg-neon'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      {/* Status de Saldo */}
                      <div className="flex items-center justify-between text-[11px] text-graphite-400 mt-2">
                        <span>
                          {isOver
                            ? `Estourado em ${formatCurrency(spent - limit)}`
                            : `Resta disponível: ${formatCurrency(remaining)}`}
                        </span>
                        <span>{catTxs.length} compras</span>
                      </div>

                      {/* Chave Pix da Categoria (se houver) */}
                      {cat.pix_key && (
                        <div className="mt-2.5 p-2 bg-purple-500/10 border border-purple-500/25 rounded-lg flex items-center justify-between text-[11px]">
                          <span className="text-purple-300 font-mono truncate">
                            Pix: {cat.pix_key}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPix(cat.pix_key!, cat.id)}
                            className="text-purple-400 hover:text-white flex items-center gap-1 shrink-0 ml-2 font-medium"
                          >
                            {copiedPixId === cat.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação do Card */}
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openCategoryTransactionsModal(cat)}
                        className="flex-1 text-xs text-graphite-300 hover:text-white bg-graphite-900 hover:bg-graphite-800 border border-border"
                      >
                        <Receipt className="w-3.5 h-3.5 mr-1 text-neon" />
                        <span>Ver Extrato Completo</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => toggleCategoryExpand(cat.id)}
                        className="text-xs bg-graphite-900 hover:bg-graphite-800 text-graphite-400 hover:text-white border border-border px-2.5"
                        title={isExpanded ? 'Recolher compras' : 'Expandir compras'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>

                    {/* Sub-lista expansível de compras da categoria */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5 animate-in fade-in duration-200">
                        {catTxs.length === 0 ? (
                          <p className="text-[11px] text-graphite-400 text-center py-2">
                            Nenhuma compra individual registrada este mês.
                          </p>
                        ) : (
                          catTxs.map((subTx) => (
                            <div
                              key={subTx.id}
                              className="p-2 bg-graphite-900/90 rounded-lg flex items-center justify-between text-xs"
                            >
                              <div className="truncate pr-2">
                                <p className="font-medium text-white truncate">
                                  {subTx.description}
                                </p>
                                <p className="text-[10px] text-graphite-400 font-mono">
                                  {formatDateBR(subTx.date)} • {subTx.payment_method || 'Pix'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono font-semibold text-white">
                                  {formatCurrency(Number(subTx.amount))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openEditTransactionModal(subTx)}
                                  title="Editar"
                                  className="p-1 rounded text-graphite-400 hover:text-white"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        `Excluir despesa "${subTx.description}"?`
                                      )
                                    ) {
                                      await deleteTransaction(subTx.id);
                                    }
                                  }}
                                  title="Excluir"
                                  className="p-1 rounded text-graphite-400 hover:text-expense"
                                >
                                  <Trash2 className="w-3 h-3" />
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
          </div>
        )}
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
