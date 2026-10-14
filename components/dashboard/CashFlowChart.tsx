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
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CashFlowPoint {
  day: string;
  receitas: number;
  despesas: number;
}

const mockCashFlowData: CashFlowPoint[] = [
  { day: '01 Out', receitas: 8500, despesas: 1200 },
  { day: '05 Out', receitas: 3200, despesas: 2400 },
  { day: '10 Out', receitas: 1800, despesas: 950 },
  { day: '15 Out', receitas: 4500, despesas: 3100 },
  { day: '20 Out', receitas: 1200, despesas: 820 },
  { day: '25 Out', receitas: 2100, despesas: 1100 },
  { day: '30 Out', receitas: 1150, despesas: 780 },
];

export function CashFlowChart() {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '12M'>('30D');

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
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockCashFlowData}
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
                    const receitas = payload[0]?.value as number;
                    const despesas = payload[1]?.value as number;
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
      </CardContent>
    </Card>
  );
}

