'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  DollarSign,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { formatCurrency, formatDateBR } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { ICON_MAP } from './CategoryModal';
import type { Category } from '@/types/database.types';

interface CategoryTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function CategoryTransactionsModal({
  isOpen,
  onClose,
  category,
}: CategoryTransactionsModalProps) {
  const {
    transactions,
    deleteTransaction,
    toggleTransactionStatus,
    setIsNewTransactionModalOpen,
  } = useFinance();

  const [copiedPix, setCopiedPix] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen || !category) return null;

  // Filtrar transações vinculadas a esta categoria
  const categoryTransactions = transactions
    .filter(
      (t) =>
        t.category_id === category.id ||
        t.category?.name?.toLowerCase() === category.name?.toLowerCase()
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Métricas acumuladas da categoria
  const totalSpent = categoryTransactions
    .filter((t) => t.type === 'expense' && t.status !== 'cancelled')
    .reduce((sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0);

  const totalIncome = categoryTransactions
    .filter((t) => t.type === 'income' && t.status !== 'cancelled')
    .reduce((sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0);

  const isIncomeCategory = category.category_nature === 'income';
  const limit = parseFloat(String(category.budget_limit)) || 0;
  const currentTotal = isIncomeCategory ? totalIncome : totalSpent;
  const remaining = Math.max(0, limit - currentTotal);
  const percentage = limit > 0 ? (currentTotal / limit) * 100 : 0;
  const isOverBudget = !isIncomeCategory && limit > 0 && currentTotal > limit;
  const isWarning = !isIncomeCategory && limit > 0 && percentage >= 80;

  const IconComponent = ICON_MAP[category.icon] || Layers;

  const handleCopyPix = () => {
    if (category.pix_key) {
      navigator.clipboard.writeText(category.pix_key);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  const handleToggleStatus = async (txId: string, currentStatus: string) => {
    setUpdatingId(txId);
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await toggleTransactionStatus(txId, newStatus);
    setUpdatingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl transition-all max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
              style={{
                backgroundColor: `${category.color || '#A3E635'}20`,
                borderColor: `${category.color || '#A3E635'}40`,
                color: category.color || '#A3E635',
              }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {category.name}
                </h3>
                <span
                  className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                    isIncomeCategory
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-graphite-800 text-graphite-300 border-border'
                  }`}
                >
                  {isIncomeCategory ? 'Receita' : 'Despesa'}
                </span>
              </div>
              <p className="text-xs text-graphite-400 mt-0.5">
                Extrato detalhado de lançamentos com datas, valores e formas de pagamento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resumo da Categoria: Teto, Gasto e Saldo Restante */}
        <div className="mt-4 p-4 rounded-xl bg-graphite-900 border border-border/80 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
            <div>
              <p className="text-[10px] uppercase font-semibold text-graphite-400">
                {isIncomeCategory ? 'Meta Mensal' : 'Teto Orçamentário'}
              </p>
              <p className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
                {formatCurrency(limit)}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-semibold text-graphite-400">
                {isIncomeCategory ? 'Recebido no Mês' : 'Gasto Acumulado'}
              </p>
              <p
                className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${
                  isIncomeCategory
                    ? 'text-emerald-400'
                    : isOverBudget
                    ? 'text-expense'
                    : 'text-white'
                }`}
              >
                {formatCurrency(currentTotal)}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-semibold text-graphite-400">
                {isIncomeCategory ? 'Restante para Meta' : 'Saldo Restante'}
              </p>
              <p
                className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${
                  remaining > 0 ? 'text-neon' : 'text-graphite-400'
                }`}
              >
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {/* Barra de Progresso */}
          {limit > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-graphite-400">Progresso do Teto:</span>
                <span
                  className={
                    isOverBudget
                      ? 'text-expense font-bold'
                      : isWarning
                      ? 'text-amber-400 font-semibold'
                      : 'text-neon font-medium'
                  }
                >
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full bg-graphite-800 rounded-full overflow-hidden border border-border/50">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isIncomeCategory
                      ? 'bg-emerald-400'
                      : isOverBudget
                      ? 'bg-expense'
                      : isWarning
                      ? 'bg-amber-400'
                      : 'bg-neon'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Chave Pix ou Conta Bancária da Categoria (se houver) */}
        {(category.pix_key || category.payment_info) && (
          <div className="mt-3 p-3 bg-graphite-900/60 border border-purple-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                {category.pix_key && (
                  <p className="text-graphite-200 font-mono">
                    <span className="text-graphite-400 font-sans">Chave Pix:</span>{' '}
                    <strong>{category.pix_key}</strong>
                  </p>
                )}
                {category.payment_info && (
                  <p className="text-[11px] text-graphite-400">
                    Dados: {category.payment_info}
                  </p>
                )}
              </div>
            </div>

            {category.pix_key && (
              <button
                type="button"
                onClick={handleCopyPix}
                className="px-2.5 py-1 text-[11px] font-medium text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Pix</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Barra de Ações: Botão de Lançar Compra / Gasto nesta Categoria */}
        <div className="flex items-center justify-between mt-5 mb-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>Compras & Lançamentos ({categoryTransactions.length})</span>
          </h4>

          <button
            type="button"
            onClick={() => {
              onClose();
              setIsNewTransactionModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg shadow-neon-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Adicionar Compra</span>
          </button>
        </div>

        {/* Lista de Compras Discriminadas */}
        <div className="flex-1 overflow-y-auto mt-1 space-y-2 max-h-[360px] pr-1">
          {categoryTransactions.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-border/80 rounded-xl bg-graphite-900/40 p-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-graphite-800 flex items-center justify-center mx-auto text-graphite-500">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs text-white font-medium">
                Nenhuma compra registrada nesta categoria este mês
              </p>
              <p className="text-[11px] text-graphite-400 max-w-xs mx-auto">
                Adicione suas saídas de supermercado, feira ou mercado para abater do teto de{' '}
                {formatCurrency(limit)}.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsNewTransactionModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-neon rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Primeira Compra</span>
              </button>
            </div>
          ) : (
            categoryTransactions.map((tx) => {
              const isPaid = tx.status === 'completed';
              const isPending = tx.status === 'pending';

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-graphite-900/80 border border-border/70 hover:border-graphite-700 rounded-xl flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-income-muted text-income'
                          : 'bg-expense-muted text-expense'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-graphite-400 mt-0.5 flex-wrap">
                        <span className="font-mono text-graphite-300">
                          {formatDateBR(tx.date)}
                        </span>
                        <span>•</span>
                        <span className="text-graphite-300 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-graphite-400" />
                          {tx.payment_method || 'Pix'}
                        </span>
                        {tx.pix_key && (
                          <span className="text-purple-300 bg-purple-500/15 px-1.5 py-0.2 rounded border border-purple-500/30">
                            Pix: {tx.pix_key}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Botão de Status com Ação Rápida de Confirmação */}
                    <button
                      type="button"
                      disabled={updatingId === tx.id}
                      onClick={() => handleToggleStatus(tx.id, tx.status)}
                      title={isPaid ? 'Clique para marcar como Pendente' : 'Clique para Confirmar Pagamento'}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1.5 border ${
                        isPaid
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-sm animate-pulse'
                          : 'bg-graphite-800 text-graphite-400 border-border'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Pago</span>
                        </>
                      ) : isPending ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Confirmar Saída</span>
                        </>
                      ) : (
                        <span>Cancelado</span>
                      )}
                    </button>

                    {/* Valor da Compra */}
                    <span className="text-xs font-bold font-mono text-white min-w-[70px] text-right">
                      {formatCurrency(Number(tx.amount))}
                    </span>

                    {/* Excluir Transação */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Excluir compra "${tx.description}"?`)) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="p-1 rounded text-graphite-500 hover:text-expense hover:bg-expense/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé com Fechamento */}
        <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
          <span className="text-xs text-graphite-400">
            Total discriminado:{' '}
            <strong className="text-white font-mono">{formatCurrency(currentTotal)}</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-graphite-300 hover:text-white hover:bg-graphite-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
