'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Loader2,
  AlertCircle,
  Copy,
  Receipt,
  CreditCard,
  QrCode,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/types/database.types';
import { useFinance } from '@/context/FinanceContext';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function QuickExpenseModal({
  isOpen,
  onClose,
  category,
}: QuickExpenseModalProps) {
  const { refreshData } = useFinance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      const limit = parseFloat(String(category.budget_limit || 0));
      setAmount(limit > 0 ? String(limit) : '');
      setDescription(category.name);
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod(
        category.category_type === 'credit_card' ? 'Cartão de Crédito' : 'Pix'
      );
      setError(null);
      setCopiedPix(false);
    }
  }, [category, isOpen]);

  if (!isOpen || !category) return null;

  const handleCopyPix = () => {
    if (category.pix_key) {
      navigator.clipboard.writeText(category.pix_key);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, informe um valor válido maior que zero.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          amount: numericAmount,
          description: description.trim() || category.name,
          category_id: category.id,
          date,
          payment_method: paymentMethod,
          pix_key: category.pix_key || undefined,
          payment_info: category.payment_info || undefined,
          status: 'completed',
          entry_subtype: category.category_type || 'variable',
          installments_count: 1,
          installment_number: 1,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao registrar saída.');
      }

      await refreshData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar pagamento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/70 bg-graphite-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-expense/10 border border-expense/30 flex items-center justify-center text-expense">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Registrar Pagamento de Despesa
              </h3>
              <p className="text-xs text-graphite-400">
                {category.name} • {category.group_name || 'Gaveta'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-expense/10 border border-expense/20 flex items-center gap-2 text-xs text-expense">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Valor */}
          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Valor Pago (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-graphite-400">
                R$
              </span>
              <Input
                type="text"
                required
                autoFocus
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg font-bold font-mono text-white bg-graphite-900 border-border focus:border-neon"
              />
            </div>
            {category.budget_limit > 0 && (
              <p className="text-[11px] text-graphite-400 mt-1 font-mono">
                Teto cadastrado: {formatCurrency(Number(category.budget_limit))}
                {category.due_day && (
                  <span className="ml-2 text-blue-400">
                    • Vence dia {category.due_day}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Descrição / Detalhe
            </label>
            <Input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs bg-graphite-900 border-border text-white"
            />
          </div>

          {/* Data e Forma de Pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-graphite-300 mb-1">
                Data do Pagamento
              </label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs bg-graphite-900 border-border text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-graphite-300 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-graphite-900 px-3 text-xs text-graphite-100 focus:border-neon focus:outline-none"
              >
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Transferência">Transferência / TED</option>
                <option value="Dinheiro">Dinheiro Espécie</option>
              </select>
            </div>
          </div>

          {/* Bloco Chave Pix se disponível */}
          {category.pix_key && (
            <div className="p-3 rounded-xl bg-graphite-900 border border-border/80 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  Chave Pix Cadastrada
                </span>
                <p className="text-xs text-white font-mono truncate mt-0.5">
                  {category.pix_key}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPix}
                className="px-2.5 py-1 rounded-lg bg-graphite-800 hover:bg-graphite-700 text-xs font-medium text-graphite-200 hover:text-white transition-colors shrink-0 flex items-center gap-1 border border-border"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
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

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="border-border text-graphite-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-neon text-graphite-950 font-bold hover:bg-neon/90 gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Confirmar Saída</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
