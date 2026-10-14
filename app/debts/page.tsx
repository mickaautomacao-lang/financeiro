'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, CalendarClock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateBR } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';

function DebtsContent() {
  const { debts } = useFinance();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-neon" />
            Controle de Dívidas & Obrigações
          </h2>
          <p className="text-xs text-graphite-400 mt-0.5">
            Monitoramento de parcelas, juros e alertas de vencimento em até 3 dias via Telegram
          </p>
        </div>

        <Button variant="neon" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span>Nova Obrigação</span>
        </Button>
      </div>

      {debts.length === 0 ? (
        <Card className="border-border bg-surface p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-neon/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma dívida ou conta pendente</h3>
          <p className="text-xs text-graphite-400 max-w-sm mx-auto mt-1 mb-4">
            Suas finanças estão limpas! Cadastre novas faturas, financiamentos ou empréstimos para receber alertas de vencimento.
          </p>
          <Button variant="neon" size="sm" className="text-xs">
            Cadastrar Conta ou Fatura
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {debts.map((d) => {
            const parts = d.due_date.split('-');
            const dueDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            const diffDays = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            const isNearDue = diffDays <= 3;

            return (
              <Card
                key={d.id}
                className={`border-border bg-surface relative overflow-hidden ${
                  isNearDue ? 'border-expense/40 bg-expense/5' : ''
                }`}
              >
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-white">
                      {d.creditor}
                    </CardTitle>
                    <p className="text-xs text-graphite-400 mt-0.5">
                      Taxa de Juros: {d.interest_rate}% a.a.
                    </p>
                  </div>

                  {isNearDue && (
                    <Badge variant="danger" className="text-[10px] gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {diffDays < 0 ? 'Vencida!' : `Vence em ${diffDays} dias!`}
                    </Badge>
                  )}
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
                      <span className="text-[11px] text-graphite-400 block">Data de Vencimento</span>
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
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function DebtsPage() {
  return (
    <DashboardLayout>
      <DebtsContent />
    </DashboardLayout>
  );
}
