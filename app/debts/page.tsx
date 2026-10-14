'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Plus,
  CalendarClock,
  CheckCircle2,
  Pencil,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateBR } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { DebtModal } from '@/components/dashboard/DebtModal';
import type { Debt } from '@/types/database.types';

function DebtsContent() {
  const { debts, refreshData } = useFinance();
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleOpenNew = () => {
    setDebtToEdit(null);
    setIsDebtModalOpen(true);
  };

  const handleOpenEdit = (debt: Debt) => {
    setDebtToEdit(debt);
    setIsDebtModalOpen(true);
  };

  const totalRemaining = debts.reduce(
    (acc, d) => acc + (parseFloat(String(d.remaining_amount)) || 0),
    0
  );
  const totalOriginal = debts.reduce(
    (acc, d) => acc + (parseFloat(String(d.total_amount)) || 0),
    0
  );

  const nearDueCount = debts.filter((d) => {
    const parts = d.due_date.split('-');
    const dueDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && d.status === 'active';
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-neon" />
            Controle de Dívidas & Obrigações
          </h2>
          <p className="text-xs text-graphite-400 mt-0.5">
            Monitoramento de parcelas, juros e alertas de vencimento em até 3 dias via Telegram
          </p>
        </div>

        <Button
          onClick={handleOpenNew}
          variant="neon"
          size="sm"
          className="gap-1.5 text-xs font-semibold shadow-neon-sm"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span>Nova Obrigação</span>
        </Button>
      </div>

      {/* KPI Cards Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-expense/10 text-expense">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Total Devedor Pendente
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {formatCurrency(totalRemaining)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Montante Original Total
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {formatCurrency(totalOriginal)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Vencendo em até 3 dias
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {nearDueCount} conta(s)
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listagem */}
      {debts.length === 0 ? (
        <Card className="border-border bg-surface p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-neon/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma dívida ou conta pendente</h3>
          <p className="text-xs text-graphite-400 max-w-sm mx-auto mt-1 mb-5">
            Suas finanças estão limpas! Cadastre novas faturas, financiamentos ou contas recorrentes para receber alertas de vencimento no Telegram.
          </p>
          <Button
            onClick={handleOpenNew}
            variant="neon"
            size="sm"
            className="text-xs font-semibold shadow-neon-sm"
          >
            Cadastrar Conta ou Fatura
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {debts.map((d) => {
            const parts = d.due_date.split('-');
            const dueDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            const diffDays = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            const isNearDue = diffDays <= 3 && d.status === 'active';
            const isPaid = d.status === 'paid';

            return (
              <Card
                key={d.id}
                className={`border-border bg-surface relative overflow-hidden flex flex-col justify-between hover:border-graphite-600 transition-all group ${
                  isNearDue ? 'border-expense/40 bg-expense/5' : ''
                }`}
              >
                <div>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-white">
                        {d.creditor}
                      </CardTitle>
                      <p className="text-xs text-graphite-400 mt-0.5 font-mono">
                        Juros: {d.interest_rate}% a.m.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPaid ? (
                        <Badge variant="success" className="text-[10px]">
                          Quitada ✅
                        </Badge>
                      ) : isNearDue ? (
                        <Badge variant="danger" className="text-[10px] gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {diffDays < 0 ? 'Vencida!' : `Vence em ${diffDays}d!`}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-graphite-400">
                          {diffDays} dias
                        </Badge>
                      )}

                      <button
                        onClick={() => handleOpenEdit(d)}
                        title="Editar Obrigação"
                        className="p-1 rounded text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="flex justify-between items-baseline font-mono">
                      <div>
                        <span className="text-[11px] text-graphite-400 block">Saldo Devedor</span>
                        <span className="text-xl font-bold text-white">
                          {formatCurrency(Number(d.remaining_amount))}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-graphite-400 block">Vencimento</span>
                        <span
                          className={`text-sm font-semibold ${
                            isNearDue ? 'text-expense' : 'text-neon'
                          }`}
                        >
                          {formatDateBR(d.due_date)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="px-6 pb-4 pt-1">
                  <Button
                    onClick={() => handleOpenEdit(d)}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-graphite-300 hover:text-white hover:border-graphite-500 border-border"
                  >
                    Editar / Quitar Conta
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Interativo de Dívidas */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        debtToEdit={debtToEdit}
        onSuccess={refreshData}
      />
    </div>
  );
}

export default function DebtsPage() {
  return (
    <DashboardLayout>
      <DebtsContent />
    </DashboardLayout>
  );
}
