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
  const [name, setName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [color, setColor] = useState('#A3E635');
  const [icon, setIcon] = useState('Tag');
  const [categoryType, setCategoryType] = useState<'variable' | 'fixed' | 'credit_card'>('variable');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(categoryToEdit && categoryToEdit.id);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setBudgetLimit(categoryToEdit.budget_limit ? String(categoryToEdit.budget_limit) : '');
      setColor(categoryToEdit.color || '#A3E635');
      setIcon(categoryToEdit.icon || 'Tag');
      setCategoryType(categoryToEdit.category_type || 'variable');
    } else {
      setName('');
      setBudgetLimit('');
      setColor('#A3E635');
      setIcon('Tag');
      setCategoryType('variable');
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

    setIsLoading(true);

    try {
      const url = '/api/finance/categories';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? { id: categoryToEdit!.id, name: name.trim(), budget_limit: numericLimit, color, icon, category_type: categoryType }
        : { name: name.trim(), budget_limit: numericLimit, color, icon, category_type: categoryType };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar categoria.');
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
                {isEditing ? 'Editar Categoria & Orçamento' : 'Nova Categoria & Orçamento'}
              </h2>
              <p className="text-xs text-graphite-400">
                {isEditing
                  ? 'Atualize o tipo, nome, ícone ou ajuste o teto mensal da regra de 80%'
                  : 'Crie uma nova categoria para agrupar despesas e definir tetos'}
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

          {/* Preview da Categoria */}
          <div className="p-3 bg-graphite-900/80 rounded-lg border border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {name || 'Nome da Categoria'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider bg-graphite-800 text-graphite-300 border border-border">
                  {categoryType === 'fixed'
                    ? 'Fixo'
                    : categoryType === 'credit_card'
                    ? 'Cartão / Parcelas'
                    : 'Variável'}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-neon font-medium">
              Teto: {formatCurrency(parseFloat(budgetLimit.replace(',', '.')) || 0)}
            </span>
          </div>

          {/* Tipo de Categoria */}
          <div>
            <label className="block text-xs font-medium text-graphite-300 mb-1.5">
              Tipo da Conta / Categoria <span className="text-expense">*</span>
            </label>
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
              placeholder="Ex: Assinaturas de Streaming, Delivery, Manutenção Carro..."
              className="w-full px-3.5 py-2.5 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>

          {/* Teto Orçamentário */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-graphite-300">
                Teto Orçamentário Mensal (R$)
              </label>
              <span className="text-[11px] text-graphite-400">
                Dispara alerta Telegram a 80%
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
                placeholder="0,00 (0 para sem limite definido)"
                className="w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-border rounded-lg text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono"
              />
            </div>
          </div>

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

