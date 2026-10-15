'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Tag,
  Utensils,
  Car,
  Home,
  Heart,
  GraduationCap,
  Tv,
  Briefcase,
  ShoppingBag,
  Plane,
  Sparkles,
  Coffee,
  Trash2,
  Check,
  CreditCard,
  Repeat,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/types/database.types';

export const ICON_MAP: Record<string, React.ElementType> = {
  Tag,
  Utensils,
  Car,
  Home,
  Heart,
  GraduationCap,
  Tv,
  Briefcase,
  ShoppingBag,
  Plane,
  Sparkles,
  Coffee,
  CreditCard,
};

export const COLOR_PALETTE = [
  { name: 'Neon Lime', hex: '#A3E635' },
  { name: 'Esmeralda', hex: '#10B981' },
  { name: 'Azul Celeste', hex: '#38BDF8' },
  { name: 'Índigo', hex: '#6366F1' },
  { name: 'Roxo Elétrico', hex: '#A855F7' },
  { name: 'Rosa Choque', hex: '#EC4899' },
  { name: 'Coral / Vermelho', hex: '#F43F5E' },
  { name: 'Âmbar Dourado', hex: '#F59E0B' },
  { name: 'Laranja Neon', hex: '#F97316' },
  { name: 'Teal Moderno', hex: '#14B8A6' },
  { name: 'Ciano', hex: '#06B6D4' },
  { name: 'Grafite Metálico', hex: '#94A3B8' },
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSuccess?: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  onSuccess,
}: CategoryModalProps) {
  const [categoryNature, setCategoryNature] = useState<'expense' | 'income'>('expense');
  const [name, setName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [color, setColor] = useState('#A3E635');
  const [icon, setIcon] = useState('Tag');
  const [categoryType, setCategoryType] = useState<'variable' | 'fixed' | 'credit_card'>('variable');
  const [dueDay, setDueDay] = useState('10');
  const [closingDay, setClosingDay] = useState('5');
  const [autoLaunchMonth, setAutoLaunchMonth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(categoryToEdit && categoryToEdit.id);

  useEffect(() => {
    if (categoryToEdit) {
      setCategoryNature(categoryToEdit.category_nature === 'income' ? 'income' : 'expense');
      setName(categoryToEdit.name || '');
      setBudgetLimit(categoryToEdit.budget_limit ? String(categoryToEdit.budget_limit) : '');
      setColor(categoryToEdit.color || (categoryToEdit.category_nature === 'income' ? '#10B981' : '#A3E635'));
      setIcon(categoryToEdit.icon || (categoryToEdit.category_nature === 'income' ? 'Briefcase' : 'Tag'));
      setCategoryType(categoryToEdit.category_type || 'variable');
      setDueDay(categoryToEdit.due_day ? String(categoryToEdit.due_day) : '10');
      setClosingDay(categoryToEdit.closing_day ? String(categoryToEdit.closing_day) : '5');
      setAutoLaunchMonth(false);
    } else {
      setCategoryNature('expense');
      setName('');
      setBudgetLimit('');
      setColor('#A3E635');
      setIcon('Tag');
      setCategoryType('variable');
      setDueDay('10');
      setClosingDay('5');
      setAutoLaunchMonth(true);
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, informe o nome da categoria.');
      return;
    }

    const numericLimit = parseFloat(budgetLimit.replace(',', '.')) || 0;
    if (numericLimit < 0) {
      setError('O teto orçamentário não pode ser negativo.');
      return;
    }

    const numericDueDay = dueDay ? parseInt(dueDay) : null;
    const numericClosingDay = closingDay ? parseInt(closingDay) : null;

    setIsLoading(true);

    try {
      const url = '/api/finance/categories';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? {
            id: categoryToEdit!.id,
            name: name.trim(),
            budget_limit: numericLimit,
            color,
            icon,
            category_type: categoryType,
            category_nature: categoryNature,
            due_day: numericDueDay,
            closing_day: categoryNature === 'income' ? null : numericClosingDay,
          }
        : {
            name: name.trim(),
            budget_limit: numericLimit,
            color,
            icon,
            category_type: categoryType,
            category_nature: categoryNature,
            due_day: numericDueDay,
            closing_day: categoryNature === 'income' ? null : numericClosingDay,
          };

      let res: Response | null = null;
      let lastError: any = null;

      // Tentativa com retry transparente em caso de oscilação momentânea de rede / deploy
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res) break;
        } catch (fetchErr) {
          lastError = fetchErr;
          if (attempt === 1) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
      }

      if (!res) {
        throw new Error(
          'Instabilidade temporária na conexão com o servidor. Por favor, tente novamente.'
        );
      }

      let data: any = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error('Resposta inválida do servidor. Tente novamente.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar categoria.');
      }

      // Se marcou para registrar recebimento do salário neste mês no caixa
      if (autoLaunchMonth && numericLimit > 0 && categoryNature === 'income') {
        try {
          const savedCategoryId = isEditing ? categoryToEdit!.id : data.category?.id;
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const dayStr = dueDay ? String(Math.min(parseInt(dueDay), 28)).padStart(2, '0') : '05';
          const transactionDate = `${year}-${month}-${dayStr}`;

          await fetch('/api/finance/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'income',
              amount: numericLimit,
              description: name.trim() || 'Salário Mensal',
              category_id: savedCategoryId,
              date: transactionDate,
              entry_subtype: categoryType,
              status: 'completed',
              payment_method: 'transferencia',
            }),
          });
        } catch (txErr) {
          console.error('Erro ao gerar transação automática de salário:', txErr);
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.message?.includes('Failed to fetch') || err?.name === 'TypeError'
          ? 'Instabilidade temporária de rede. Por favor, tente clicar novamente.'
          : err.message || 'Falha ao processar solicitação.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToEdit?.id) return;
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a categoria "${categoryToEdit.name}"?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/finance/categories?id=${categoryToEdit.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao excluir categoria.');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao excluir categoria.');
    } finally {
      setIsDeleting(false);
    }
  };

  const IconComponent = ICON_MAP[icon] || Tag;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-graphite-900/60">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${color}20`, color: color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isEditing
                  ? `Editar Categoria (${categoryNature === 'income' ? 'Receita' : 'Despesa'})`
                  : `Nova Categoria (${categoryNature === 'income' ? 'Receita' : 'Despesa'})`}
              </h2>
              <p className="text-xs text-graphite-400">
                {categoryNature === 'income'
                  ? 'Cadastre fontes de renda fixa, freelas e previsões financeiras'
                  : 'Crie e configure contas, tetos de gastos e datas de vencimento'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Seletor de Natureza: Despesa vs Receita */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Natureza da Categoria <span className="text-expense">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategoryNature('expense');
                  if (color === '#10B981') setColor('#A3E635');
                  if (icon === 'Briefcase') setIcon('Tag');
                }}
                className={`p-2.5 rounded-lg border text-center transition-all flex items-center justify-center gap-2 ${
                  categoryNature === 'expense'
                    ? 'border-expense bg-expense/15 text-white font-semibold shadow-sm'
                    : 'border-border bg-graphite-900/60 text-graphite-400 hover:border-graphite-700'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-expense" />
                <span className="text-xs">Despesa (Saída)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoryNature('income');
                  if (color === '#A3E635') setColor('#10B981');
                  if (icon === 'Tag') setIcon('Briefcase');
                }}
                className={`p-2.5 rounded-lg border text-center transition-all flex items-center justify-center gap-2 ${
                  categoryNature === 'income'
                    ? 'border-emerald-500 bg-emerald-500/15 text-white font-semibold shadow-sm'
                    : 'border-border bg-graphite-900/60 text-graphite-400 hover:border-graphite-700'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs">Receita (Entrada)</span>
              </button>
            </div>
          </div>

          {/* Preview da Categoria */}
          <div className="p-3 bg-graphite-900/80 rounded-lg border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-white">
                  {name || 'Nome da Categoria'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border ${
                    categoryNature === 'income'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-graphite-800 text-graphite-300 border-border'
                  }`}
                >
                  {categoryNature === 'income' ? 'Receita' : 'Despesa'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider bg-graphite-800 text-graphite-300 border border-border">
                  {categoryNature === 'income'
                    ? categoryType === 'fixed'
                      ? 'Entrada Fixa'
                      : 'Freelance / Variável'
                    : categoryType === 'fixed'
                    ? 'Fixo Mensal'
                    : categoryType === 'credit_card'
                    ? 'Cartão / Parcelas'
                    : 'Variável'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono shrink-0">
              {dueDay && (
                <span className="text-[11px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {categoryNature === 'income' ? `Cai dia ${dueDay}` : `Vence dia ${dueDay}`}
                </span>
              )}
              {categoryNature === 'expense' && categoryType === 'credit_card' && (
                <span className="text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Fecha {closingDay || '5'}
                </span>
              )}
              <span className={categoryNature === 'income' ? 'text-emerald-400 font-medium' : 'text-neon font-medium'}>
                {categoryNature === 'income'
                  ? categoryType === 'fixed'
                    ? 'Salário: '
                    : 'Meta: '
                  : 'Teto: '}
                {formatCurrency(parseFloat(budgetLimit.replace(',', '.')) || 0)}
              </span>
            </div>
          </div>

          {/* Tipo de Categoria */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              {categoryNature === 'income' ? 'Subtipo da Receita' : 'Tipo da Despesa / Conta'}{' '}
              <span className="text-expense">*</span>
            </label>

            {categoryNature === 'income' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryType('fixed')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    categoryType === 'fixed'
                      ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-sm'
                      : 'border-border bg-graphite-900/60 text-graphite-400 hover:border-graphite-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-white">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    Entrada Fixa
                  </div>
                  <p className="text-[10px] text-graphite-400 leading-tight">
                    Salário CLT, Pró-Labore, Aposentadoria, Aluguéis
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryType('variable')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    categoryType === 'variable' || categoryType === 'credit_card'
                      ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-sm'
                      : 'border-border bg-graphite-900/60 text-graphite-400 hover:border-graphite-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Freelance & Variável
                  </div>
                  <p className="text-[10px] text-graphite-400 leading-tight">
                    Projetos extras, Freelas, Comissões e Dividendos
                  </p>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryType('variable')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    categoryType === 'variable'
                      ? 'border-neon bg-neon/10 text-white shadow-neon-sm'
                      : 'border-border bg-graphite-900/60 text-graphite-400 hover:border-graphite-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-white">
                    <ShoppingBag className="w-3.5 h-3.5 text-neon" />
                    Variável
                  </div>
                  <p className="text-[10px] text-graphite-400 leading-tight">
                    Dia a dia, mercado e gastos livres
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryType('fixed')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    categoryType === 'fixed'
                      ? 'border-neon bg-neon/10 text-white shadow-neon-sm'
                      : 'border-border bg-graphite-900/60 text-graphite-400 hover:border-graphite-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-white">
                    <Repeat className="w-3.5 h-3.5 text-blue-400" />
                    Fixo Mensal
                  </div>
                  <p className="text-[10px] text-graphite-400 leading-tight">
                    Escola, água, energia, internet
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryType('credit_card')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    categoryType === 'credit_card'
                      ? 'border-neon bg-neon/10 text-white shadow-neon-sm'
                      : 'border-border bg-graphite-900/60 text-graphite-400 hover:border-graphite-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-white">
                    <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                    Cartão / Parcelas
                  </div>
                  <p className="text-[10px] text-graphite-400 leading-tight">
                    Compras em 3x, 6x, 12x (Jarbas, Vadir...)
                  </p>
                </button>
              </div>
            )}
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Nome da Categoria <span className="text-expense">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                categoryNature === 'income'
                  ? 'Ex: Salário Empresa X, Freelance Design, Dividendos...'
                  : 'Ex: Assinaturas de Streaming, Delivery, Manutenção Carro...'
              }
              className="w-full px-3.5 py-2.5 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>

          {/* Datas para Receita */}
          {categoryNature === 'income' && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <Calendar className="w-3.5 h-3.5" />
                Previsão de Recebimento Mensal
              </div>
              <div>
                <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                  Dia do Mês Previsto para Recebimento (1 a 31)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-graphite-400">Dia</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="5"
                    className="w-full pl-10 pr-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-graphite-400 mt-1">
                  Ex: Dia 5 (Salário), Dia 15 (Adiantamento/Freela), Dia 20 (Aluguéis recebidos)
                </p>
              </div>
            </div>
          )}

          {/* Campos Específicos para Despesas: Fixo e Cartão */}
          {categoryNature === 'expense' && categoryType === 'fixed' && (
            <div className="p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                <Calendar className="w-3.5 h-3.5" />
                Vencimento do Custo Fixo
              </div>
              <div>
                <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                  Dia do Vencimento Mensal (1 a 31)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-graphite-400">Dia</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="10"
                    className="w-full pl-10 pr-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono"
                  />
                </div>
                <p className="text-[10px] text-graphite-400 mt-1">
                  Ex: Dia 10 (Escola vence dia 10, Energia dia 15, Água dia 20...)
                </p>
              </div>
            </div>
          )}

          {categoryNature === 'expense' && categoryType === 'credit_card' && (
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/25 rounded-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                <Calendar className="w-3.5 h-3.5" />
                Ciclo do Cartão & Fatura (Compra x Vencimento)
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Dia da Compra / Fechamento */}
                <div>
                  <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                    Dia de Fechamento / Melhor Compra
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-graphite-400">Dia</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={closingDay}
                      onChange={(e) => setClosingDay(e.target.value)}
                      placeholder="5"
                      className="w-full pl-10 pr-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-graphite-400 mt-0.5">
                    Virada da fatura / melhor dia
                  </p>
                </div>

                {/* Dia de Vencimento */}
                <div>
                  <label className="block text-[11px] font-medium text-graphite-300 mb-1">
                    Dia de Vencimento da Fatura
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-graphite-400">Dia</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
                      placeholder="15"
                      className="w-full pl-10 pr-3 py-2 bg-graphite-900 border border-border rounded-lg text-xs text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-graphite-400 mt-0.5">
                    Data limite de pagamento
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Valor: Salário Líquido / Meta Freelance / Teto de Despesa */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-graphite-200">
                {categoryNature === 'income'
                  ? categoryType === 'fixed'
                    ? 'Valor do Salário Líquido Mensal (R$)'
                    : 'Estimativa / Meta Média Mensal (R$)'
                  : 'Teto Orçamentário Mensal (R$)'}
                <span className="text-expense ml-1">*</span>
              </label>
              <span className="text-[11px] text-graphite-400">
                {categoryNature === 'income'
                  ? categoryType === 'fixed'
                    ? 'Quanto cai líquido na conta todo mês'
                    : 'Expectativa média de ganhos'
                  : 'Dispara alerta Telegram a 80%'}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-graphite-400 font-mono">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                placeholder={
                  categoryNature === 'income'
                    ? categoryType === 'fixed'
                      ? 'Ex: 3500,00'
                      : 'Ex: 1500,00'
                    : '0,00'
                }
                className={`w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none transition-colors font-mono ${
                  categoryNature === 'income'
                    ? 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    : 'focus:border-neon focus:ring-1 focus:ring-neon'
                }`}
              />
            </div>
            {categoryNature === 'income' && categoryType === 'fixed' && (
              <p className="text-[10px] text-graphite-400 mt-1">
                Informe o valor exato que cai na sua conta todo dia {dueDay || '5'}.
              </p>
            )}
          </div>

          {/* Opção Inteligente: Lançar no Saldo deste mês */}
          {categoryNature === 'income' && categoryType === 'fixed' && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    Lançar no Saldo deste mês agora?
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoLaunchMonth}
                  onChange={(e) => setAutoLaunchMonth(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                {autoLaunchMonth
                  ? `✓ Ao salvar, registrará a entrada de R$ ${budgetLimit || '0,00'} no caixa deste mês no dia ${dueDay || '5'}.`
                  : 'Deixe desmarcado se você prefere registrar manualmente na tela de Nova Transação.'}
              </p>
            </div>
          )}

          {/* Seletor de Cores */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-2">
              Cor de Identificação Visual
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className="h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105 relative border"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: color === c.hex ? '#ffffff' : 'transparent',
                  }}
                >
                  {color === c.hex && (
                    <Check className="w-4 h-4 text-black font-bold" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Ícones */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-2">
              Ícone Representativo
            </label>
            <div className="grid grid-cols-6 gap-2">
              {Object.keys(ICON_MAP).map((iconKey) => {
                const CurrentIcon = ICON_MAP[iconKey];
                const isSelected = icon === iconKey;
                return (
                  <button
                    type="button"
                    key={iconKey}
                    onClick={() => setIcon(iconKey)}
                    className={`h-10 rounded-lg flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'border-neon bg-neon/15 text-neon shadow-neon-sm'
                        : 'border-border bg-graphite-900 text-graphite-400 hover:text-white hover:border-graphite-600'
                    }`}
                  >
                    <CurrentIcon className="w-4 h-4" />
                  </button>
                );
              })}
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
                Excluir Categoria
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
                {isEditing ? 'Atualizar Categoria' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

