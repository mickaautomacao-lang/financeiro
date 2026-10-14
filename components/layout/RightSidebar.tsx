'use client';

import React from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateBR } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';

export function RightSidebar() {
  const { kpi, alerts, transactions, goals } = useFinance();

  const emergencyGoal = goals.find((g) =>
    g.name.toLowerCase().includes('reserva')
  );
  const emergencyAmount = emergencyGoal ? Number(emergencyGoal.current_amount) : 0;
  const netWorth = kpi.currentBalance + kpi.totalInvestedOrGoals - kpi.pendingDebtsTotal;

  const recentTransactions = transactions.slice(0, 4);

  return (
    <aside className="hidden xl:flex w-80 flex-col gap-6 border-l border-border bg-surface/50 p-6 overflow-y-auto">
      {/* Resumo Real da Carteira / Patrimônio */}
      <Card className="bg-gradient-to-br from-graphite-900 to-surface border-border relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-neon/10 blur-2xl" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
              Patrimônio Líquido
            </span>
            <Wallet className="h-4 w-4 text-neon" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(netWorth)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
            <span className="text-graphite-400">Disponível em Conta</span>
            <span
              className={`font-semibold font-mono ${
                kpi.currentBalance >= 0 ? 'text-white' : 'text-expense'
              }`}
            >
              {formatCurrency(kpi.currentBalance)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
            <span className="text-graphite-400">Reserva de Emergência</span>
            <span className="font-semibold text-neon font-mono">
              {formatCurrency(emergencyAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-graphite-400">Investimentos / Metas</span>
            <span className="font-semibold text-graphite-200 font-mono">
              {formatCurrency(kpi.totalInvestedOrGoals)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Inteligentes (Integrados ao Telegram & n8n) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-neon" />
            Alertas & Notificações
          </h4>
          <a
            href="https://t.me/dashfina_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-neon font-mono bg-neon-muted px-1.5 py-0.5 rounded border border-neon/30 flex items-center gap-1 hover:bg-neon/20 transition-colors"
          >
            <span>@dashfina_bot</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <div className="space-y-2.5">
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-border bg-graphite-900/40 p-3 text-center">
              <CheckCircle2 className="h-5 w-5 text-neon/60 mx-auto mb-1" />
              <p className="text-xs font-semibold text-white">Sem alertas pendentes</p>
              <p className="text-[11px] text-graphite-400 mt-0.5">
                Gastos e contas dentro do planejado.
              </p>
            </div>
          ) : (
            alerts.slice(0, 3).map((al, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 transition-colors ${
                  al.type === 'danger'
                    ? 'border-expense/30 bg-expense/5 hover:bg-expense/10'
                    : 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {al.type === 'danger' ? (
                    <CalendarClock className="h-4 w-4 text-expense shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        al.type === 'danger' ? 'text-red-300' : 'text-amber-300'
                      }`}
                    >
                      {al.title}
                    </p>
                    <p className="text-[11px] text-graphite-300 mt-0.5 leading-relaxed">
                      {al.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={al.type === 'danger' ? 'danger' : 'warning'}
                        className="text-[10px] py-0 px-1.5 font-mono"
                      >
                        {al.badge}
                      </Badge>
                      <span className="text-[10px] text-graphite-400">{al.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Feed de Atividades Recentes em Tempo Real */}
      <div className="flex-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 mb-3">
          Atividades Recentes
        </h4>

        {recentTransactions.length === 0 ? (
          <div className="rounded-xl border border-border bg-graphite-900/30 p-4 text-center text-xs text-graphite-400">
            Nenhuma atividade recente registrada.
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      tx.type === 'income'
                        ? 'bg-income-muted text-income'
                        : 'bg-expense-muted text-expense'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-white truncate">{tx.description}</p>
                    <p className="text-[10px] text-graphite-400">
                      {formatDateBR(tx.date)} • {tx.source || 'Web'}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold font-mono shrink-0 ${
                    tx.type === 'income' ? 'text-income' : 'text-expense'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
