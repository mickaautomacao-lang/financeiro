'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, CalendarClock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateBR } from '@/lib/utils';

export default function DebtsPage() {
  const mockDebts = [
    {
      creditor: 'Cartão Black (Nubank)',
      total: 3420.0,
      remaining: 3420.0,
      dueDate: '2026-10-16',
      interest: '0.00%',
      isNearDue: true, // vence em 3 dias
    },
    {
      creditor: 'Financiamento Imobiliário (Caixa)',
      total: 240000.0,
      remaining: 185400.0,
      dueDate: '2026-10-28',
      interest: '9.2% a.a.',
      isNearDue: false,
    },
  ];

  return (
    <DashboardLayout>
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
          <Plus className="h-3.5 w-3.5" />
          <span>Nova Obrigação</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockDebts.map((d) => (
          <Card
            key={d.creditor}
            className={`border-border bg-surface relative overflow-hidden ${
              d.isNearDue ? 'border-expense/40 bg-expense/5' : ''
            }`}
          >
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white">
                  {d.creditor}
                </CardTitle>
                <p className="text-xs text-graphite-400 mt-0.5">
                  Taxa: {d.interest}
                </p>
              </div>

              {d.isNearDue && (
                <Badge variant="danger" className="text-[10px] gap-1">
                  <CalendarClock className="h-3 w-3" />
                  Vence em 3 dias (Alerta Ativo)
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="flex justify-between items-baseline font-mono">
                <div>
                  <span className="text-[11px] text-graphite-400 block">Saldo Devedor</span>
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(d.remaining)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-graphite-400 block">Data de Vencimento</span>
                  <span className="text-sm font-semibold text-neon">
                    {formatDateBR(d.dueDate)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

