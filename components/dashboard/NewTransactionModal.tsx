'use client';

import React, { useState, useEffect } from 'react';
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
  Briefcase,
  Sparkles,
  TrendingUp,
  Repeat,
  ShoppingBag,
  Layers,
  QrCode,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Category, Transaction, TransactionType, TransactionStatus } from '@/types/database.types';
import { useFinance } from '@/context/FinanceContext';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  transactionToEdit?: Transaction | null;
  onSuccess: () => void;
}

export function NewTransactionModal({
  isOpen,
  onClose,
  categories,
  transactionToEdit,
  onSuccess,
}: NewTransactionModalProps) {
  const { deleteTransaction } = useFinance();
  const isEditing = Boolean(transactionToEdit && transactionToEdit.id);
  const [type, setType] = useState<TransactionType>('expense');
  // Subtipo para Receita: 'fixed' (Salário/Renda Fixa), 'freelance' (Freelances/Projetos), 'investments' (Investimentos/Outros)
  // Subtipo para Despesa: 'fixed' (Fixo Mensal), 'credit_card' (Cartão/Parcelado), 'variable' (Variável)
  const [entrySubtype, setEntrySubtype] = useState<string>('variable');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [pixKey, setPixKey] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('completed');
  
  // Controle de parcelamento para compras no cartão
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('6');
  const [currentInstallment, setCurrentInstallment] = useState('1');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'expense');
      setEntrySubtype(transactionToEdit.entry_subtype || 'variable');
      setAmount(transactionToEdit.amount ? String(transactionToEdit.amount) : '');
      setDescription(transactionToEdit.description || '');
      setCategoryId(transactionToEdit.category_id || '');
      setCustomCategory('');
      setDate(
        transactionToEdit.date
          ? transactionToEdit.date.split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setPaymentMethod(transactionToEdit.payment_method || 'Pix');
      setPixKey(transactionToEdit.pix_key || '');
      setPaymentInfo(transactionToEdit.payment_info || '');
      setStatus(transactionToEdit.status || 'completed');
      setIsInstallment(
        Boolean(transactionToEdit.installments_count && transactionToEdit.installments_count > 1)
      );
      setTotalInstallments(String(transactionToEdit.installments_count || 1));
      setCurrentInstallment(String(transactionToEdit.installment_number || 1));
    } else {
      setType('expense');
      setEntrySubtype('variable');
      setAmount('');
      setDescription('');
      setCategoryId('');
      setCustomCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Pix');
      setPixKey('');
      setPaymentInfo('');
      setStatus('completed');
      setIsInstallment(false);
      setTotalInstallments('6');
      setCurrentInstallment('1');
    }
    setErrorMsg('');
    setIsSuccess(false);
  }, [transactionToEdit, isOpen]);

  // Filtrar categorias conforme o Tipo selecionado (Receita vs Despesa)
  const filteredCategories = categories.filter((cat) => {
    if (type === 'income') {
      return cat.category_nature === 'income';
    }
    return cat.category_nature !== 'income';
  });

  // Ajustar defaults inteligentes ao trocar de Tipo ou Subtipo
  useEffect(() => {
    if (type === 'income') {
      if (entrySubtype === 'credit_card') {
        setEntrySubtype('fixed');
      }
      // Auto-selecionar categoria de receita correspondente
      const targetCat = filteredCategories.find((c) => {
        if (entrySubtype === 'fixed') return c.name.toLowerCase().includes('salário') || c.category_type === 'fixed';
        if (entrySubtype === 'freelance') return c.name.toLowerCase().includes('freelance');
        return c.name.toLowerCase().includes('investimento') || c.category_type === 'variable';
      });
      if (targetCat) {
        setCategoryId(targetCat.id);
      }
      setPaymentMethod('Pix');
      setIsInstallment(false);
    } else {
      // Para despesa
      if (entrySubtype === 'freelance' || entrySubtype === 'investments') {
        setEntrySubtype('variable');
      }
      if (entrySubtype === 'credit_card') {
        setPaymentMethod('Cartão de Crédito');
        const cardCat = filteredCategories.find((c) => c.category_type === 'credit_card');
        if (cardCat) setCategoryId(cardCat.id);
      } else if (entrySubtype === 'fixed') {
        const fixedCat = filteredCategories.find((c) => c.category_type === 'fixed');
        if (fixedCat) setCategoryId(fixedCat.id);
      }
    }
  }, [type, entrySubtype]);

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
      const payload: any = {
        type,
        amount: numericAmount,
        description: description.trim(),
        category_id: categoryId || undefined,
        category_name: customCategory.trim() || undefined,
        date,
        payment_method: paymentMethod,
        pix_key: pixKey ? pixKey.trim() : undefined,
        payment_info: paymentInfo ? paymentInfo.trim() : undefined,
        status,
        entry_subtype: entrySubtype,
        installments_count: isInstallment ? parseInt(totalInstallments) || 1 : 1,
        installment_number: isInstallment ? parseInt(currentInstallment) || 1 : 1,
      };

      if (isEditing) {
        payload.id = transactionToEdit!.id;
      }

      const res = await fetch('/api/finance/transactions', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao registrar transação');
      }

      // Se for uma compra parcelada de cartão nova, criar também na tabela category_installments se houver categoryId
      if (!isEditing && type === 'expense' && isInstallment && categoryId && parseInt(totalInstallments) > 1) {
        try {
          await fetch('/api/finance/installments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category_id: categoryId,
              description: description.trim(),
              installment_amount: numericAmount,
              total_installments: parseInt(totalInstallments),
              current_installment: parseInt(currentInstallment) || 1,
              start_date: date,
              purchase_date: date,
            }),
          });
        } catch {
          // Não bloqueia o fluxo principal
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setAmount('');
        setDescription('');
        setCategoryId('');
        setCustomCategory('');
        setPixKey('');
        setPaymentInfo('');
        setIsInstallment(false);
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionToEdit?.id) return;
    const ok = window.confirm(
      `Deseja realmente excluir a transação "${transactionToEdit.description}" no valor de R$ ${transactionToEdit.amount}?`
    );
    if (!ok) return;

    setIsDeleting(true);
    try {
      const success = await deleteTransaction(transactionToEdit.id);
      if (success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg('Erro ao excluir transação. Tente novamente.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir transação.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlaceholder = () => {
    if (type === 'income') {
      if (entrySubtype === 'fixed') return 'Ex: Salário mensal CLT, Pró-labore mensal...';
      if (entrySubtype === 'freelance') return 'Ex: Freelance Web Design, Consultoria Cliente X...';
      return 'Ex: Rendimentos Nubank, Venda de equipamento, Dividendos...';
    } else {
      if (entrySubtype === 'fixed') return 'Ex: Mensalidade Escola, Conta de Luz, Internet Tim...';
      if (entrySubtype === 'credit_card') return 'Ex: Compra Celular em 6x, Supermercado fatura, Peças...';
      return 'Ex: Almoço restaurante, Posto Shell, Farmácia...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl transition-all max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm border transition-colors ${
                type === 'income'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-neon/15 border-neon/30 text-neon'
              }`}
            >
              {type === 'income' ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing
                  ? `Editar Transação (${type === 'income' ? 'Receita' : 'Despesa'})`
                  : type === 'income'
                  ? 'Lançar Receita (Entrada)'
                  : 'Lançar Despesa (Saída)'}
              </h3>
              <p className="text-xs text-graphite-400">
                {isEditing
                  ? 'Modifique os dados, altere categoria, valor, data ou exclua o lançamento'
                  : type === 'income'
                  ? 'Registro de entradas fixas, freelances e rendimentos'
                  : 'Controle de custos fixos, cartões e despesas variáveis'}
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
            <h4 className="text-base font-bold text-white">Transação Salva com Sucesso!</h4>
            <p className="text-xs text-graphite-400">Atualizando indicadores e gráficos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* 1. Toggle Principal: Despesa vs Receita */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-graphite-900 border border-border">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setEntrySubtype('variable');
                }}
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
                onClick={() => {
                  setType('income');
                  setEntrySubtype('fixed');
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-graphite-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span>Receita (Entrada)</span>
              </button>
            </div>

            {/* 2. Sub-classificação Dinâmica (Entrada Fixa x Freelance / Custo Fixo x Cartão x Variável) */}
            <div>
              <label className="text-[11px] font-medium text-graphite-300 block mb-1.5 uppercase tracking-wider">
                {type === 'income' ? 'Classificação da Entrada' : 'Classificação da Saída'}
              </label>

              {type === 'income' ? (
                /* Chips para Receita */
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntrySubtype('fixed')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      entrySubtype === 'fixed'
                        ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-sm'
                        : 'border-border bg-graphite-900 text-graphite-400 hover:border-graphite-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      Entrada Fixa
                    </div>
                    <p className="text-[10px] text-graphite-400 leading-tight">
                      Salário, Pró-Labore
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntrySubtype('freelance')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      entrySubtype === 'freelance'
                        ? 'border-blue-400 bg-blue-500/15 text-white shadow-sm'
                        : 'border-border bg-graphite-900 text-graphite-400 hover:border-graphite-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Freelance
                    </div>
                    <p className="text-[10px] text-graphite-400 leading-tight">
                      Projetos, Extras, Freelas
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntrySubtype('variable')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      entrySubtype === 'variable'
                        ? 'border-amber-400 bg-amber-500/15 text-white shadow-sm'
                        : 'border-border bg-graphite-900 text-graphite-400 hover:border-graphite-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      Outros / Rend.
                    </div>
                    <p className="text-[10px] text-graphite-400 leading-tight">
                      Dividendos, Reembolsos
                    </p>
                  </button>
                </div>
              ) : (
                /* Chips para Despesa */
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntrySubtype('fixed')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      entrySubtype === 'fixed'
                        ? 'border-blue-400 bg-blue-500/15 text-white shadow-sm'
                        : 'border-border bg-graphite-900 text-graphite-400 hover:border-graphite-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                      <Repeat className="w-3.5 h-3.5 text-blue-400" />
                      Fixo Mensal
                    </div>
                    <p className="text-[10px] text-graphite-400 leading-tight">
                      Escola, Casa, Água/Luz
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntrySubtype('credit_card')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      entrySubtype === 'credit_card'
                        ? 'border-purple-400 bg-purple-500/15 text-white shadow-sm'
                        : 'border-border bg-graphite-900 text-graphite-400 hover:border-graphite-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                      <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                      Cartão / Parcelas
                    </div>
                    <p className="text-[10px] text-graphite-400 leading-tight">
                      Jarbas, Fatura, 3x, 6x
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntrySubtype('variable')}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      entrySubtype === 'variable'
                        ? 'border-neon bg-neon/15 text-white shadow-sm'
                        : 'border-border bg-graphite-900 text-graphite-400 hover:border-graphite-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-neon" />
                      Variável
                    </div>
                    <p className="text-[10px] text-graphite-400 leading-tight">
                      Mercado, Lazer, Posto
                    </p>
                  </button>
                </div>
              )}
            </div>

            {/* Atalhos Rápidos para Despesas (ex: Supermercado 200) */}
            {type === 'expense' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-graphite-400">
                    Atalhos Rápidos de Gastos:
                  </span>
                  <span className="text-[10px] text-graphite-500">1-clique para preencher</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[
                    { label: 'Supermercado', icon: '🛒', catKw: 'alimenta' },
                    { label: 'Feira Livre', icon: '🥬', catKw: 'alimenta' },
                    { label: 'Combustível', icon: '⛽', catKw: 'transporte' },
                    { label: 'Delivery / Lanche', icon: '🍔', catKw: 'alimenta' },
                    { label: 'Farmácia', icon: '💊', catKw: 'saúde' },
                    { label: 'Escola', icon: '🏫', catKw: 'escola' },
                    { label: 'Luz / Energia', icon: '⚡', catKw: 'casa' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setDescription(preset.label);
                        const target = filteredCategories.find(
                          (c) =>
                            c.name.toLowerCase().includes(preset.catKw) ||
                            c.name.toLowerCase().includes(preset.label.toLowerCase())
                        );
                        if (target) {
                          setCategoryId(target.id);
                          if (target.category_type) setEntrySubtype(target.category_type);
                          if (target.pix_key) setPixKey(target.pix_key);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-graphite-900 border border-border/80 text-graphite-300 hover:text-white hover:border-graphite-600 transition-all text-xs whitespace-nowrap flex items-center gap-1 shrink-0"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Valor */}
            <div>
              <label className="text-xs font-medium text-graphite-300 block mb-1">
                {type === 'income'
                  ? entrySubtype === 'fixed'
                    ? 'Valor do Salário / Recebimento (R$) *'
                    : 'Valor do Freelance / Entrada (R$) *'
                  : 'Valor da Despesa (R$) *'}
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

            {/* 4. Descrição */}
            <div>
              <label className="text-xs font-medium text-graphite-300 block mb-1">
                Descrição / Detalhe *
              </label>
              <Input
                type="text"
                required
                placeholder={getPlaceholder()}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs bg-graphite-900 border-border"
              />
            </div>

            {/* 5. Categoria Filtrada Conforme Tipo */}
            <div>
              <label className="text-xs font-medium text-graphite-300 block mb-1 flex items-center justify-between">
                <span>
                  {type === 'income' ? 'Categoria da Receita' : 'Categoria da Despesa'} *
                </span>
                <span className="text-[10px] text-graphite-400">
                  {filteredCategories.length} disponíveis
                </span>
              </label>

              <select
                value={categoryId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setCategoryId(selectedId);
                  if (selectedId) {
                    setCustomCategory('');
                    const foundCat = categories.find((c) => c.id === selectedId);
                    if (foundCat) {
                      if (foundCat.pix_key && !pixKey) {
                        setPixKey(foundCat.pix_key);
                      }
                      if (foundCat.payment_info && !paymentInfo) {
                        setPaymentInfo(foundCat.payment_info);
                      }
                      if (type === 'income' && foundCat.category_type === 'fixed') {
                        setEntrySubtype('fixed');
                        if (!description) setDescription(foundCat.name);
                        if (!amount || amount === '0' || amount === '0,00') {
                          if (foundCat.budget_limit > 0) {
                            setAmount(String(foundCat.budget_limit));
                          }
                        }
                      }
                    }
                  }
                }}
                className="w-full h-10 rounded-lg border border-border bg-graphite-900 px-3 text-xs text-graphite-100 focus:border-neon focus:outline-none"
              >
                <option value="">Selecione uma categoria...</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                    {cat.category_nature === 'income'
                      ? ` [${cat.category_type === 'fixed' ? 'Entrada Fixa' : 'Freelance / Variável'}]`
                      : cat.budget_limit > 0
                      ? ` (Teto: R$ ${cat.budget_limit})`
                      : ''}
                  </option>
                ))}
              </select>

              {!categoryId && (
                <Input
                  type="text"
                  placeholder={`Ou crie uma nova categoria de ${type === 'income' ? 'receita' : 'despesa'}...`}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-1.5 text-xs bg-graphite-900/60 border-border"
                />
              )}
            </div>

            {/* Se for Despesa em Cartão: Controle de Parcelas Opcional */}
            {type === 'expense' && entrySubtype === 'credit_card' && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    É uma compra parcelada?
                  </span>
                  <input
                    type="checkbox"
                    checked={isInstallment}
                    onChange={(e) => setIsInstallment(e.target.checked)}
                    className="h-4 w-4 rounded accent-purple-500 cursor-pointer"
                  />
                </div>

                {isInstallment && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] text-graphite-300 mb-1">
                        Total de Parcelas
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="120"
                        value={totalInstallments}
                        onChange={(e) => setTotalInstallments(e.target.value)}
                        placeholder="Ex: 6"
                        className="w-full px-2.5 py-1.5 bg-graphite-900 border border-border rounded-lg text-xs text-white font-mono focus:border-neon focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-graphite-300 mb-1">
                        Parcela Atual (a pagar)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={totalInstallments}
                        value={currentInstallment}
                        onChange={(e) => setCurrentInstallment(e.target.value)}
                        placeholder="Ex: 1"
                        className="w-full px-2.5 py-1.5 bg-graphite-900 border border-border rounded-lg text-xs text-white font-mono focus:border-neon focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. Data e Forma de Pagamento */}
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
                  Forma de {type === 'income' ? 'Recebimento' : 'Pagamento'}
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
                  <option value="TED / Transferência">TED / Transferência / Conta</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>

            {/* Campo Opcional: Chave Pix ou Dados de Conta / Favorecido */}
            {paymentMethod === 'Pix' && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-purple-400" />
                    Chave Pix do Recebedor / Conta (Opcional)
                  </label>
                  <span className="text-[10px] text-graphite-400">Salva no comprovante</span>
                </div>
                <Input
                  type="text"
                  placeholder="Ex: CPF, CNPJ, Celular, E-mail ou Chave Aleatória..."
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="text-xs bg-graphite-900 border-border text-white placeholder-graphite-500 font-mono"
                />
              </div>
            )}

            {(paymentMethod === 'TED / Transferência' || paymentMethod === 'Boleto') && (
              <div className="p-3 bg-graphite-900/80 border border-border rounded-xl space-y-1.5 animate-in fade-in duration-150">
                <label className="text-[11px] font-medium text-graphite-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  Dados da Conta / Banco / Favorecido (Opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Nubank Ag 0001 Conta 12345-6 / Nome Favorecido..."
                  value={paymentInfo}
                  onChange={(e) => setPaymentInfo(e.target.value)}
                  className="text-xs bg-graphite-900 border-border text-white placeholder-graphite-500 font-mono"
                />
              </div>
            )}

            {/* 7. Situação / Status do Pagamento */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-graphite-300 block">
                Situação da Transação:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    status === 'completed'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-sm'
                      : 'bg-graphite-900 border-border text-graphite-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      status === 'completed' ? 'text-emerald-400' : 'text-graphite-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-semibold block leading-tight">
                      {type === 'income' ? 'Já Recebido' : 'Já Foi Pago'}
                    </span>
                    <span className="text-[10px] text-graphite-400">
                      Liquidado no caixa
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    status === 'pending'
                      ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                      : 'bg-graphite-900 border-border text-graphite-400 hover:text-white'
                  }`}
                >
                  <Clock
                    className={`w-4 h-4 ${
                      status === 'pending' ? 'text-amber-400' : 'text-graphite-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-semibold block leading-tight">
                      {type === 'income' ? 'Pendente a Receber' : 'Pendente a Pagar'}
                    </span>
                    <span className="text-[10px] text-graphite-400">
                      Confirmar depois
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-border">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitting || isDeleting}
                    onClick={handleDelete}
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-red-500/30 flex items-center gap-1.5"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Excluir</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant={type === 'income' ? 'secondary' : 'neon'}
                  size="sm"
                  disabled={isSubmitting || isDeleting}
                  className={`text-xs min-w-[150px] font-semibold ${
                    type === 'income'
                      ? 'bg-emerald-400 hover:bg-emerald-500 text-black border-transparent shadow-sm'
                      : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{isEditing ? 'Atualizando...' : 'Gravando...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      <span>
                        {isEditing
                          ? 'Salvar Alterações'
                          : type === 'income'
                          ? 'Salvar Receita'
                          : 'Salvar Despesa'}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

