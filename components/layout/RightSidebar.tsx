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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export function RightSidebar() {
  return (
    <aside className="hidden xl:flex w-80 flex-col gap-6 border-l border-border bg-surface/50 p-6 overflow-y-auto">
      {/* Resumo Rápido da Carteira */}
      <Card className="bg-gradient-to-br from-graphite-900 to-surface border-border relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-neon/10 blur-2xl" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
              Patrimônio Líquido
            </span>
            <Wallet className="h-4 w-4 text-neon" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(84350.25)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
            <span className="text-graphite-400">Disponível em Conta</span>
            <span className="font-semibold text-white">{formatCurrency(18240.50)}</span>
          </div>
          <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
            <span className="text-graphite-400">Reserva de Emergência</span>
            <span className="font-semibold text-neon">{formatCurrency(50000.00)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-graphite-400">Investimentos / Metas</span>
            <span className="font-semibold text-graphite-200">{formatCurrency(16109.75)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Inteligentes (Integração Telegram / n8n) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-neon" />
            Alertas & Notificações
          </h4>
          <span className="text-[10px] text-neon font-mono bg-neon-muted px-1.5 py-0.5 rounded">
            Telegram Link
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Alerta Orçamento > 80% */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 transition-colors hover:bg-amber-500/10">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">
                  Atenção ao Orçamento!
                </p>
                <p className="text-[11px] text-graphite-300 mt-0.5 leading-relaxed">
                  Categoria <strong>Alimentação</strong> atingiu <strong>84.2%</strong> do limite planejado.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                    R$ 1.684 de R$ 2.000
                  </Badge>
                  <span className="text-[10px] text-graphite-400">Há 2 horas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerta de Vencimento de Dívida */}
          <div className="rounded-xl border border-expense/30 bg-expense/5 p-3 transition-colors hover:bg-expense/10">
            <div className="flex items-start gap-2.5">
              <CalendarClock className="h-4 w-4 text-expense shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-300">
                  Vencimento Próximo (3 dias)
                </p>
                <p className="text-[11px] text-graphite-300 mt-0.5 leading-relaxed">
                  Fatura Cartão Black (Nubank) vence dia <strong>16/10</strong>.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="danger" className="text-[10px] py-0 px-1.5">
                    {formatCurrency(3420.00)}
                  </Badge>
                  <span className="text-[10px] text-graphite-400">Notificado no Bot</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Atingida */}
          <div className="rounded-xl border border-neon/30 bg-neon-muted p-3 transition-colors hover:bg-neon/15">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-neon shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-neon">
                  Meta Parcial Alcançada!
                </p>
                <p className="text-[11px] text-graphite-300 mt-0.5 leading-relaxed">
                  Aporte de R$ 1.500 concluído para a <strong>Reserva de Emergência</strong>.
                </p>
                <span className="text-[10px] text-graphite-400 mt-1 block">Ontem às 18:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed de Atividades Recentes */}
      <div className="flex-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 mb-3">
          Atividades Recentes
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-income-muted text-income">
                <ArrowDownLeft className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-medium text-white">Google Sheets Sync</p>
                <p className="text-[10px] text-graphite-400">Recebimento Consultoria</p>
              </div>
            </div>
            <span className="font-semibold text-income">+{formatCurrency(6500.00)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-expense-muted text-expense">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-medium text-white">Supermercado Pão de Açúcar</p>
                <p className="text-[10px] text-graphite-400">Via Cartão Débito</p>
              </div>
            </div>
            <span className="font-semibold text-expense">-{formatCurrency(482.30)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-graphite-800 text-graphite-300">
                <Send className="h-3.5 w-3.5 text-neon" />
              </div>
              <div>
                <p className="font-medium text-white">Telegram Bot</p>
                <p className="text-[10px] text-graphite-400">Comando /resumo executado</p>
              </div>
            </div>
            <span className="text-[10px] text-graphite-400">14:15</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

