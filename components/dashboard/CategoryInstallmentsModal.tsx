'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Loader2,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Sparkles,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import type { Category, CategoryInstallment } from '@/types/database.types';

interface CategoryInstallmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function CategoryInstallmentsModal({
  isOpen,
  onClose,
  category,
}: CategoryInstallmentsModalProps) {
  const { installments, payInstallment, refreshData } = useFinance();

  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('6');
  const [currentInstallment, setCurrentInstallment] = useState('1');
  const [dueDay, setDueDay] = useState('10');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  if (!isOpen || !category) return null;

  // Filtrar parcelas desta categoria
  const categoryInstallments = installments.filter(
    (item) => item.category_id === category.id
  );

  const activeInstallments = categoryInstallments.filter(
    (item) => item.status === 'active'
  );
  const completedInstallments = categoryInstallments.filter(
    (item) => item.status === 'completed'
  );

  // Totais calculados
  const totalMonthlyCommitment = activeInstallments.reduce(
    (sum, item) => sum + Number(item.installment_amount || 0),
    0
  );

  const totalRemainingBalance = activeInstallments.reduce((sum, item) => {
    const remaining = Math.max(0, item.total_installments - item.current_installment + 1);
    return sum + remaining * Number(item.installment_amount || 0);
  }, 0);

  // Ordenar por quem termina primeiro
  const sortedByRemaining = [...activeInstallments].sort((a, b) => {
    const remA = a.total_installments - a.current_installment + 1;
    const remB = b.total_installments - b.current_installment + 1;
    return remA - remB;
  });

  const earliestEnding = sortedByRemaining.length > 0 ? sortedByRemaining[0] : null;
  const earliestRemaining = earliestEnding
    ? Math.max(1, earliestEnding.total_installments - earliestEnding.current_installment + 1)
    : 0;

  // Gerar projeção de alívio mensal (step-down timeline)
  const projectionMonths: Array<{
    monthOffset: number;
    monthLabel: string;
    totalAmount: number;
    activeCount: number;
  }> = [];

  if (activeInstallments.length > 0) {
    const maxRemaining = Math.max(
      ...activeInstallments.map((i) => i.total_installments - i.current_installment + 1)
    );

    const now = new Date();
    for (let m = 1; m <= Math.min(maxRemaining, 12); m++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + m - 1, 1);
      const monthLabel = targetDate.toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      });

      let monthlySum = 0;
      let activeInThisMonth = 0;

      for (const inst of activeInstallments) {
        const remainingForThis = inst.total_installments - inst.current_installment + 1;
        if (m <= remainingForThis) {
          monthlySum += Number(inst.installment_amount || 0);
          activeInThisMonth++;
        }
      }

      projectionMonths.push({
        monthOffset: m,
        monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        totalAmount: monthlySum,
        activeCount: activeInThisMonth,
      });
    }
  }

  // Handlers
  const handleCreateInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!description.trim()) {
      setFeedback({ type: 'error', message: 'Informe a descrição da compra.' });
      return;
    }

    const amount = parseFloat(installmentAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setFeedback({ type: 'error', message: 'O valor da parcela deve ser maior que zero.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/finance/installments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: category.id,
          description: description.trim(),
          installment_amount: amount,
          total_installments: parseInt(totalInstallments) || 1,
          current_installment: parseInt(currentInstallment) || 1,
          due_day: parseInt(dueDay) || 10,
          start_date: startDate,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao cadastrar compra.');
      }

      setFeedback({
        type: 'success',
        message: `Compra "${description}" adicionada com sucesso!`,
      });
      setDescription('');
      setInstallmentAmount('');
      setTotalInstallments('6');
      setCurrentInstallment('1');
      setNotes('');
      setShowAddForm(false);
      await refreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao salvar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = async (inst: CategoryInstallment) => {
    setPayingId(inst.id);
    setFeedback(null);

    try {
      const success = await payInstallment(inst.id);
      if (success) {
        const next = inst.current_installment + 1;
        if (next > inst.total_installments) {
          setFeedback({
            type: 'success',
            message: `🎉 Parcela ${inst.current_installment}/${inst.total_installments} de "${inst.description}" paga! Compra QUITADA!`,
          });
        } else {
          setFeedback({
            type: 'success',
            message: `✅ Parcela ${inst.current_installment}/${inst.total_installments} de "${inst.description}" registrada no extrato! Próxima: ${next}/${inst.total_installments}.`,
          });
        }
      } else {
        setFeedback({ type: 'error', message: 'Falha ao registrar pagamento da parcela.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro no pagamento.' });
    } finally {
      setPayingId(null);
    }
  };

  const handleDelete = async (inst: CategoryInstallment) => {
    const confirmDelete = window.confirm(
      `Deseja realmente remover o controle da compra "${inst.description}"?`
    );
    if (!confirmDelete) return;

    setDeletingId(inst.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/finance/installments?id=${inst.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Compra removida com sucesso.' });
        await refreshData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Falha ao remover compra.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao remover.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-graphite-900/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
              style={{
                backgroundColor: `${category.color || '#A3E635'}20`,
                borderColor: `${category.color || '#A3E635'}40`,
                color: category.color || '#A3E635',
              }}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {category.name}
                </h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Cartão / Parcelado
                </span>
              </div>
              <p className="text-xs text-graphite-400 mt-0.5">
                Controle de compras individuais, parcelas e projeção de alívio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 border animate-in fade-in ${
                feedback.type === 'success'
                  ? 'bg-neon/10 border-neon/30 text-neon'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Cards de Resumo Consolidado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-graphite-900/90 border border-border/80 rounded-xl">
              <span className="text-[11px] text-graphite-400 block mb-1">
                Compromisso Mensal Atual
              </span>
              <span className="text-lg font-bold text-neon font-mono">
                {formatCurrency(totalMonthlyCommitment)}
              </span>
              <span className="text-[10px] text-graphite-500 block mt-0.5">
                Soma das parcelas ativas deste mês
              </span>
            </div>

            <div className="p-3.5 bg-graphite-900/90 border border-border/80 rounded-xl">
              <span className="text-[11px] text-graphite-400 block mb-1">
                Saldo a Quitar Total
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {formatCurrency(totalRemainingBalance)}
              </span>
              <span className="text-[10px] text-graphite-500 block mt-0.5">
                {activeInstallments.length} {activeInstallments.length === 1 ? 'compra ativa' : 'compras ativas'}
              </span>
            </div>

            <div className="p-3.5 bg-graphite-900/90 border border-border/80 rounded-xl">
              <span className="text-[11px] text-graphite-400 block mb-1">
                Teto Orçado p/ Categoria
              </span>
              <span className="text-lg font-bold text-graphite-300 font-mono">
                {formatCurrency(category.budget_limit || 0)}
              </span>
              <span className="text-[10px] text-graphite-500 block mt-0.5">
                {totalMonthlyCommitment <= (category.budget_limit || 0)
                  ? 'Dentro do teto previsto'
                  : '⚠️ Atenção: excede o teto'}
              </span>
            </div>
          </div>

          {/* DESTAQUE DE INTELIGÊNCIA: Alívio Programado & Qual Parcela Termina Primeiro */}
          {activeInstallments.length > 1 && earliestEnding && (
            <div className="p-4 bg-gradient-to-r from-neon/10 via-graphite-900 to-neon/5 border border-neon/30 rounded-xl relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neon/20 text-neon shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      Primeiro Alívio Financeiro Programado
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon/20 text-neon font-bold">
                      Termina em {earliestRemaining} {earliestRemaining === 1 ? 'mês' : 'meses'}
                    </span>
                  </div>
                  <p className="text-xs text-graphite-300 leading-relaxed">
                    A compra <strong className="text-white">"{earliestEnding.description}"</strong> (
                    <span className="font-mono text-neon font-medium">
                      {formatCurrency(earliestEnding.installment_amount)}/mês
                    </span>
                    ) termina primeiro! Em{' '}
                    <strong className="text-white">
                      {earliestRemaining} {earliestRemaining === 1 ? 'mês' : 'meses'}
                    </strong>
                    , seu compromisso nesta categoria cairá de{' '}
                    <strong className="text-white font-mono">
                      {formatCurrency(totalMonthlyCommitment)}
                    </strong>{' '}
                    para{' '}
                    <strong className="text-neon font-mono">
                      {formatCurrency(totalMonthlyCommitment - earliestEnding.installment_amount)}/mês
                    </strong>
                    .
                  </p>
                </div>
              </div>

              {/* Step-down timeline chips */}
              {projectionMonths.length > 1 && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-graphite-400 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-neon" />
                      Evolução do Desembolso Mensal:
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    {projectionMonths.slice(0, 6).map((step, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-1.5 rounded-lg border flex flex-col shrink-0 min-w-[90px] ${
                          idx === 0
                            ? 'bg-neon/15 border-neon/40 text-white'
                            : 'bg-graphite-900 border-border/70 text-graphite-300'
                        }`}
                      >
                        <span className="text-[10px] text-graphite-400 font-mono">
                          {step.monthLabel}
                        </span>
                        <span className="font-mono font-bold text-xs mt-0.5">
                          {formatCurrency(step.totalAmount)}
                        </span>
                        <span className="text-[9px] text-graphite-500">
                          {step.activeCount} {step.activeCount === 1 ? 'parcela' : 'parcelas'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botão para Exibir/Ocultar Formulário de Nova Compra */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-semibold text-graphite-200 uppercase tracking-wider">
              Compras Cadastradas ({activeInstallments.length} ativas)
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 text-xs font-medium text-black bg-neon hover:bg-neon-muted rounded-lg shadow-neon-sm transition-all flex items-center gap-1.5"
            >
              {showAddForm ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Fechar Formulário
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Nova Compra nesta Categoria
                </>
              )}
            </button>
          </div>

          {/* Formulário de Adicionar Nova Parcela */}
          {showAddForm && (
            <form
              onSubmit={handleCreateInstallment}
              className="p-4 bg-graphite-900/90 border border-neon/30 rounded-xl space-y-3.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-white">
                  Cadastrar Nova Parcela para "{category.name}"
                </span>
                <span className="text-[11px] text-graphite-400">
                  Ex: Compra Celular, Peças, Empréstimo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Descrição */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                    Descrição da Compra *
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Celular novo, Manutenção, Peças Moto..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                  />
                </div>

                {/* Valor da Parcela */}
                <div>
                  <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                    Valor da Parcela (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                    placeholder="Ex: 500.00"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono"
                  />
                </div>

                {/* Total de Parcelas */}
                <div>
                  <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                    Total de Parcelas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    placeholder="Ex: 6"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono"
                  />
                </div>

                {/* Parcela Atual */}
                <div>
                  <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                    Parcela Atual (a pagar) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalInstallments}
                    required
                    value={currentInstallment}
                    onChange={(e) => setCurrentInstallment(e.target.value)}
                    placeholder="Ex: 1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono"
                  />
                </div>

                {/* Dia do Vencimento */}
                <div>
                  <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                    Dia do Vencimento (1 a 31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-graphite-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg shadow-neon-sm transition-all flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          )}

          {/* Lista de Parcelas Ativas */}
          {activeInstallments.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl bg-graphite-900/40">
              <CreditCard className="w-8 h-8 text-graphite-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-graphite-300">
                Nenhuma compra parcelada ativa cadastrada nesta categoria.
              </p>
              <p className="text-[11px] text-graphite-500 mt-0.5">
                Clique em "Nova Compra nesta Categoria" para adicionar uma compra em 3x, 6x, etc.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInstallments.map((inst) => {
                const remaining = Math.max(0, inst.total_installments - inst.current_installment + 1);
                const progress = Math.min(
                  100,
                  Math.round(((inst.current_installment - 1) / inst.total_installments) * 100)
                );
                const isEarliest = earliestEnding?.id === inst.id && activeInstallments.length > 1;

                return (
                  <div
                    key={inst.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isEarliest
                        ? 'bg-graphite-900/90 border-neon/40 shadow-sm'
                        : 'bg-graphite-900/60 border-border hover:border-graphite-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">
                            {inst.description}
                          </h4>
                          {isEarliest && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neon/15 text-neon border border-neon/30">
                              Termina Primeiro ⚡
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-graphite-400 mt-1">
                          <span className="font-mono text-white font-medium">
                            {formatCurrency(inst.installment_amount)}/mês
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-graphite-400" />
                            Parcela {inst.current_installment} de {inst.total_installments}
                          </span>
                          <span>•</span>
                          <span>Vence todo dia {inst.due_day || 10}</span>
                          <span>•</span>
                          <span className="text-graphite-300">
                            Faltam {remaining} {remaining === 1 ? 'mês' : 'meses'}
                          </span>
                        </div>
                      </div>

                      {/* Ações Rápidas */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={payingId === inst.id}
                          onClick={() => handlePay(inst)}
                          className="px-3 py-1.5 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg shadow-neon-sm transition-all flex items-center gap-1.5"
                          title="Registra a despesa no extrato e avança a parcela"
                        >
                          {payingId === inst.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Pagar Parcela {inst.current_installment}
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === inst.id}
                          onClick={() => handleDelete(inst)}
                          className="p-1.5 text-graphite-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          title="Excluir compra parcelada"
                        >
                          {deletingId === inst.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Barra de Progresso de Quitação */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-graphite-400 font-mono">
                        <span>
                          {inst.current_installment - 1} de {inst.total_installments} pagas ({progress}%)
                        </span>
                        <span>
                          Resta pagar: {formatCurrency(remaining * inst.installment_amount)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-graphite-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neon transition-all duration-300 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Compras Concluídas / Quitadas (se houver) */}
          {completedInstallments.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-medium text-graphite-400 uppercase tracking-wider block mb-2">
                Quitadas Anteriormente ({completedInstallments.length})
              </span>
              <div className="space-y-2 opacity-65">
                {completedInstallments.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-2.5 rounded-lg border border-border/50 bg-graphite-900/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-graphite-300 line-through">
                        {inst.description}
                      </span>
                      <span className="text-graphite-500 font-mono">
                        ({inst.total_installments}x de {formatCurrency(inst.installment_amount)})
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium uppercase">
                      Totalmente Quitado
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-graphite-900/80 flex items-center justify-between">
          <span className="text-[11px] text-graphite-400">
            Pagar uma parcela lança a despesa automaticamente no seu extrato.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-graphite-300 hover:text-white hover:bg-graphite-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

