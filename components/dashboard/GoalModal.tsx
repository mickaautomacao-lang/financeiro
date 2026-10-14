'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Target, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Goal } from '@/types/database.types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
  onSuccess?: () => void;
}

export function GoalModal({
  isOpen,
  onClose,
  goalToEdit,
  onSuccess,
}: GoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'paused'>('in_progress');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(goalToEdit && goalToEdit.id);

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name || '');
      setTargetAmount(goalToEdit.target_amount ? String(goalToEdit.target_amount) : '');
      setCurrentAmount(goalToEdit.current_amount ? String(goalToEdit.current_amount) : '0');
      setDeadline(goalToEdit.deadline || '');
      setStatus(goalToEdit.status || 'in_progress');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline('');
      setStatus('in_progress');
    }
    setError(null);
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const targetNum = parseFloat(targetAmount.replace(',', '.')) || 0;
  const currentNum = parseFloat(currentAmount.replace(',', '.')) || 0;
  const progressPct = targetNum > 0 ? Math.min(100, (currentNum / targetNum) * 100) : 0;
  const remaining = Math.max(0, targetNum - currentNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, informe o nome da meta.');
      return;
    }

    if (targetNum <= 0) {
      setError('O valor alvo da meta deve ser maior que R$ 0,00.');
      return;
    }

    setIsLoading(true);

    try {
      const url = '/api/finance/goals';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? {
            id: goalToEdit!.id,
            name: name.trim(),
            target_amount: targetNum,
            current_amount: currentNum,
            deadline: deadline || null,
            status,
          }
        : {
            name: name.trim(),
            target_amount: targetNum,
            current_amount: currentNum,
            deadline: deadline || null,
            status,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar meta.');
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
    if (!goalToEdit?.id) return;
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a meta "${goalToEdit.name}"?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/finance/goals?id=${goalToEdit.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao excluir meta.');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao excluir meta.');
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
            <div className="w-9 h-9 rounded-lg bg-neon/15 text-neon flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isEditing ? 'Editar Meta Financeira' : 'Nova Meta & Reserva'}
              </h2>
              <p className="text-xs text-graphite-400">
                {isEditing
                  ? 'Atualize os valores, prazos ou status da sua meta'
                  : 'Defina objetivos como Reserva de Emergência, Viagens ou Investimentos'}
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

          {/* Preview Dinâmico do Progresso */}
          <div className="p-3.5 bg-graphite-900/80 rounded-lg border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                {name || 'Nome do Objetivo'}
              </span>
              <span className="text-xs font-mono font-bold text-neon">
                {progressPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-graphite-950 rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full bg-neon shadow-neon-sm transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-graphite-400">
              <span>Atual: {formatCurrency(currentNum)}</span>
              <span>Alvo: {formatCurrency(targetNum)}</span>
            </div>
          </div>

          {/* Nome da Meta */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Nome da Meta <span className="text-expense">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Reserva de Emergência (6 meses), Entrada Casa, Carro Novo..."
              className="w-full px-3.5 py-2.5 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>

          {/* Valores: Alvo e Atual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1.5">
                Valor Alvo (Objetivo) <span className="text-expense">*</span>
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
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="10000,00"
                  className="w-full pl-10 pr-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1.5">
                Valor Já Acumulado
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-graphite-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Prazo e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1.5">
                Data Prazo (Opcional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              >
                <option value="in_progress">Em Progresso 🚀</option>
                <option value="completed">Concluída 🎉</option>
                <option value="paused">Pausada ⏸️</option>
              </select>
            </div>
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
                {isEditing ? 'Atualizar Meta' : 'Criar Meta'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

