'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Debt } from '@/types/database.types';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtToEdit?: Debt | null;
  onSuccess?: () => void;
}

export function DebtModal({
  isOpen,
  onClose,
  debtToEdit,
  onSuccess,
}: DebtModalProps) {
  const [creditor, setCreditor] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'active' | 'paid' | 'negotiating'>('active');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(debtToEdit && debtToEdit.id);

  useEffect(() => {
    if (debtToEdit) {
      setCreditor(debtToEdit.creditor || '');
      setTotalAmount(debtToEdit.total_amount ? String(debtToEdit.total_amount) : '');
      setRemainingAmount(
        debtToEdit.remaining_amount !== undefined ? String(debtToEdit.remaining_amount) : ''
      );
      setInterestRate(debtToEdit.interest_rate ? String(debtToEdit.interest_rate) : '0');
      setDueDate(debtToEdit.due_date || '');
      setStatus(debtToEdit.status || 'active');
    } else {
      setCreditor('');
      setTotalAmount('');
      setRemainingAmount('');
      setInterestRate('0');
      // Padrão hoje + 7 dias
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDueDate(d.toISOString().split('T')[0]);
      setStatus('active');
    }
    setError(null);
  }, [debtToEdit, isOpen]);

  if (!isOpen) return null;

  const totalNum = parseFloat(totalAmount.replace(',', '.')) || 0;
  const remNum = remainingAmount
    ? parseFloat(remainingAmount.replace(',', '.')) || 0
    : totalNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!creditor.trim()) {
      setError('Por favor, informe o credor ou identificação da conta.');
      return;
    }

    if (totalNum <= 0) {
      setError('O valor total da dívida deve ser maior que R$ 0,00.');
      return;
    }

    if (!dueDate) {
      setError('A data de vencimento é obrigatória.');
      return;
    }

    setIsLoading(true);

    try {
      const url = '/api/finance/debts';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? {
            id: debtToEdit!.id,
            creditor: creditor.trim(),
            total_amount: totalNum,
            remaining_amount: remNum,
            interest_rate: parseFloat(interestRate.replace(',', '.')) || 0,
            due_date: dueDate,
            status,
          }
        : {
            creditor: creditor.trim(),
            total_amount: totalNum,
            remaining_amount: remNum,
            interest_rate: parseFloat(interestRate.replace(',', '.')) || 0,
            due_date: dueDate,
            status,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar dívida/conta.');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao processar solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!debtToEdit?.id) return;
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a obrigação "${debtToEdit.creditor}"?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/finance/debts?id=${debtToEdit.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao excluir dívida.');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao excluir dívida.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-graphite-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-expense/15 text-expense flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isEditing ? 'Editar Obrigação / Conta' : 'Nova Dívida & Obrigação'}
              </h2>
              <p className="text-xs text-graphite-400">
                {isEditing
                  ? 'Ajuste valores, data de vencimento ou status da conta'
                  : 'Cadastre faturas de cartão, financiamentos ou contas recorrentes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Nome do Credor */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Credor / Identificação da Conta <span className="text-expense">*</span>
            </label>
            <input
              type="text"
              required
              value={creditor}
              onChange={(e) => setCreditor(e.target.value)}
              placeholder="Ex: Fatura Cartão XP, Financiamento Carro, Enel Energia..."
              className="w-full px-3.5 py-2.5 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>

          {/* Valores: Total e Restante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1.5">
                Valor Total <span className="text-expense">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-graphite-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={totalAmount}
                  onChange={(e) => {
                    setTotalAmount(e.target.value);
                    if (!isEditing && !remainingAmount) {
                      setRemainingAmount(e.target.value);
                    }
                  }}
                  placeholder="2500,00"
                  className="w-full pl-10 pr-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1.5">
                Valor Restante / Pendente
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-graphite-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={remainingAmount}
                  onChange={(e) => setRemainingAmount(e.target.value)}
                  placeholder="Deixe em branco se for o total"
                  className="w-full pl-10 pr-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Data de Vencimento e Juros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1.5">
                Data de Vencimento <span className="text-expense">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1.5">
                Taxa de Juros (% a.m.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Status da Dívida
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            >
              <option value="active">Ativa / Em Aberto ⏰</option>
              <option value="paid">Totalmente Paga / Quitada ✅</option>
              <option value="negotiating">Em Negociação 💬</option>
            </select>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
            {isEditing ? (
              <button
                type="button"
                disabled={isDeleting || isLoading}
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Excluir
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading || isDeleting}
                className="px-4 py-2 text-xs font-medium text-graphite-300 hover:text-white hover:bg-graphite-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isDeleting}
                className="px-4 py-2 text-xs font-semibold text-black bg-neon hover:bg-neon-muted rounded-lg shadow-neon-sm transition-all flex items-center gap-1.5"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isEditing ? 'Atualizar Obrigação' : 'Criar Obrigação'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

