'use client';

import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';

export function KPICards() {
  const { kpi, isLoading } = useFinance();

  const cards = [
    {
      title: 'Receita Líquida (Mês)',
      amount: kpi.netRevenue,
      change: kpi.netRevenue > 0 ? '+Margem Positiva' : kpi.netRevenue < 0 ? '-Déficit' : '0.00%',
      isPositive: kpi.netRevenue >= 0,
      comparison: 'Entradas - Saídas',
      icon: TrendingUp,
      accentColor: 'border-neon/40 text-neon',
      glow: 'shadow-neon-sm',
    },
    {
      title: 'Entradas Realizadas',
      amount: kpi.totalIncome,
      change: kpi.totalIncome > 0 ? 'Entradas Registradas' : 'Sem receitas',
      isPositive: true,
      comparison: 'Total acumulado no período',
      icon: ArrowDownRight,
      accentColor: 'border-income/30 text-income',
      glow: '',
    },
    {
      title: 'Despesas Realizadas',
      amount: kpi.totalExpenses,
      change: kpi.totalExpenses > 0 ? 'Despesas Liquidadas' : 'Sem gastos',
      isPositive: kpi.totalExpenses === 0,
      comparison: 'Total de saídas registradas',
      icon: ArrowUpRight,
      accentColor: 'border-expense/30 text-expense',
      glow: '',
    },
    {
      title: 'Reserva & Metas',
      amount: kpi.totalInvestedOrGoals,
      change: `${kpi.emergencyFundProgress}%`,
      isPositive: true,
      comparison: 'Progresso da meta',
      icon: Target,
      accentColor: 'border-cyan-500/30 text-cyan-400',
      glow: '',
      hasProgressBar: true,
      progress: kpi.emergencyFundProgress,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`relative overflow-hidden border-border bg-surface hover:border-graphite-600 transition-all duration-200 group ${
              index === 0
                ? 'neon-border-glow bg-gradient-to-b from-surface via-surface to-neon-muted/20'
                : ''
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-graphite-400">
                  {card.title}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-graphite-900 border ${card.accentColor} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white font-mono">
                  {isLoading ? '...' : formatCurrency(card.amount)}
                </span>
              </div>

              {card.hasProgressBar ? (
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-graphite-400">
                    <span>{card.comparison}</span>
                    <span className="font-semibold text-neon">{card.change}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-graphite-900 border border-border">
                    <div
                      className="h-full rounded-full bg-neon shadow-neon-sm transition-all duration-500"
                      style={{ width: `${Math.min(card.progress || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 flex items-center gap-2">
                  <Badge
                    variant={index === 0 ? 'neon' : card.isPositive ? 'success' : 'danger'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {card.change}
                  </Badge>
                  <span className="text-[11px] text-graphite-400 truncate">
                    {card.comparison}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
