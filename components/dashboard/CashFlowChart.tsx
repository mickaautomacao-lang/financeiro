'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { Plus, BarChart3 } from 'lucide-react';

export function CashFlowChart() {
  const { cashFlowData, setIsNewTransactionModalOpen } = useFinance();
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '12M'>('30D');

  const hasData = cashFlowData && cashFlowData.length > 0;

  return (
    <Card className="border-border bg-surface">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            Fluxo de Caixa (Receitas vs. Despesas)
            <span className="text-[10px] text-neon bg-neon-muted px-1.5 py-0.5 rounded border border-neon/30">
              Tempo Real
            </span>
          </CardTitle>
          <p className="text-xs text-graphite-400 mt-0.5">
            Comparativo de evolução financeira diária
          </p>
        </div>

        {/* Controles de Filtro e Legenda */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neon shadow-neon-sm" />
              <span className="text-graphite-300">Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-expense" />
              <span className="text-graphite-300">Despesas</span>
            </div>
          </div>

          <div className="flex rounded-lg border border-border bg-graphite-900 p-0.5 text-xs">
            {(['30D', '90D', '12M'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-surface text-neon shadow-sm'
                    : 'text-graphite-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {!hasData ? (
          <div className="h-72 w-full flex flex-col items-center justify-center border-dashed border border-border/60 rounded-xl bg-graphite-900/30 p-6 text-center">
            <BarChart3 className="h-10 w-10 text-graphite-600 mb-2 stroke-[1.5]" />
            <h4 className="text-sm font-semibold text-white">Nenhum movimento registrado</h4>
            <p className="text-xs text-graphite-400 max-w-sm mt-1 mb-4">
              Comece adicionando receitas ou despesas pelo botão abaixo ou enviando uma mensagem no Telegram <strong>@dashfina_bot</strong>!
            </p>
            <Button
              variant="neon"
              size="sm"
              onClick={() => setIsNewTransactionModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar Primeira Transação</span>
            </Button>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cashFlowData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3E635" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A3E635" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F87171" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1E2230"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="#676E7D"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#676E7D"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const receitas = (payload[0]?.value as number) || 0;
                      const despesas = (payload[1]?.value as number) || 0;
                      const saldo = receitas - despesas;
                      return (
                        <div className="rounded-xl border border-border bg-graphite-900/95 p-3 shadow-xl backdrop-blur-md">
                          <p className="text-xs font-semibold text-graphite-300 mb-2">
                            {label}
                          </p>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-graphite-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-neon" />
                                Receitas:
                              </span>
                              <span className="font-semibold text-white">
                                {formatCurrency(receitas)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-graphite-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-expense" />
                                Despesas:
                              </span>
                              <span className="font-semibold text-white">
                                {formatCurrency(despesas)}
                              </span>
                            </div>
                            <div className="border-t border-border pt-1.5 mt-1.5 flex items-center justify-between gap-4">
                              <span className="text-graphite-400">Saldo Líquido:</span>
                              <span
                                className={`font-semibold ${
                                  saldo >= 0 ? 'text-neon' : 'text-expense'
                                }`}
                              >
                                {formatCurrency(saldo)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="receitas"
                  stroke="#A3E635"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#neonGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  stroke="#F87171"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
