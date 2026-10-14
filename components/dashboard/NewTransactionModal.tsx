'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Tag,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Category, TransactionType, TransactionStatus } from '@/types/database.types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

export function NewTransactionModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: NewTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [status, setStatus] = useState<TransactionStatus>('completed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Informe um valor válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Informe uma descrição para a transação.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          description: description.trim(),
          category_id: categoryId || undefined,
          category_name: customCategory.trim() || undefined,
          date,
          payment_method: paymentMethod,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao registrar transação');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setAmount('');
        setDescription('');
        setCategoryId('');
        setCustomCategory('');
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon shadow-neon-sm">
              <Plus className="h-4 w-4 text-graphite-950 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Nova Transação
              </h3>
              <p className="text-xs text-graphite-400">
                Lançamento contábil de precisão
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

        {errorMsg && (
          <div className="mt-4 p-2.5 rounded-lg bg-expense/10 border border-expense/30 text-expense text-xs">
            {errorMsg}
          </div>
        )}

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="h-12 w-12 text-neon animate-bounce" />
            <h4 className="text-base font-bold text-white">Transação Salva!</h4>
            <p className="text-xs text-graphite-400">Atualizando indicadores...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Seletor Tipo: Receita vs Despesa */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-graphite-900 border border-border">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-expense/20 text-expense border border-expense/40 shadow-sm'
                    : 'text-graphite-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Despesa (Saída)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-income/20 text-income border border-income/40 shadow-sm'
                    : 'text-graphite-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span>Receita (Entrada)</span>
              </button>
            </div>

            {/* Valor */}
            <div>
              <label className="text-xs font-medium text-graphite-300 block mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-sm font-bold text-graphite-400">
                  R$
                </span>
                <Input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 text-lg font-bold font-mono text-white bg-graphite-900 border-border focus:border-neon"
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-xs font-medium text-graphite-300 block mb-1">
                Descrição / Estabelecimento *
              </label>
              <Input
                type="text"
                required
                placeholder="Ex: Almoço restaurante, Salário mensal, Posto Shell..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs bg-graphite-900 border-border"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="text-xs font-medium text-graphite-300 block mb-1 flex items-center justify-between">
                <span>Categoria</span>
                <span className="text-[10px] text-graphite-400">
                  Ou digite uma nova abaixo
                </span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (e.target.value) setCustomCategory('');
                }}
                className="w-full h-10 rounded-lg border border-border bg-graphite-900 px-3 text-xs text-graphite-100 focus:border-neon focus:outline-none"
              >
                <option value="">Selecione uma categoria cadastrada...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (Teto: R$ {cat.budget_limit})
                  </option>
                ))}
              </select>

              {!categoryId && (
                <Input
                  type="text"
                  placeholder="Ou digite o nome de uma nova categoria..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-1.5 text-xs bg-graphite-900/60 border-border"
                />
              )}
            </div>

            {/* Data e Forma de Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-graphite-300 block mb-1">
                  Data
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs bg-graphite-900 border-border"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-graphite-300 block mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-graphite-900 px-3 text-xs text-graphite-100 focus:border-neon focus:outline-none"
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto">Boleto</option>
                  <option value="TED / Transferência">TED / Transferência</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 pt-1 text-xs">
              <span className="text-graphite-400">Status:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-graphite-200">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                  className="accent-neon"
                />
                <span>Concluído (Liquidado)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-graphite-200">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="accent-amber-400"
                />
                <span>Pendente</span>
              </label>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="neon"
                size="sm"
                disabled={isSubmitting}
                className="text-xs min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Gravando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Salvar Transação</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

