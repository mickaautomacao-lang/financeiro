'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export default function GoalsPage() {
  const mockGoals = [
    {
      name: 'Reserva de Emergência Selic',
      current: 50000.0,
      target: 60000.0,
      progress: 83.3,
      deadline: 'Dezembro 2026',
      status: 'in_progress',
    },
    {
      name: 'Aporte Carteira Global (ETF)',
      current: 12500.0,
      target: 20000.0,
      progress: 62.5,
      deadline: 'Julho 2027',
      status: 'in_progress',
    },
    {
      name: 'Férias & Viagem Internacional',
      current: 8000.0,
      target: 8000.0,
      progress: 100.0,
      deadline: 'Novembro 2026',
      status: 'completed',
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-neon" />
            Metas & Reserva Financeira
          </h2>
          <p className="text-xs text-graphite-400 mt-0.5">
            Acompanhe o acúmulo de patrimônio e o progresso dos seus objetivos
          </p>
        </div>

        <Button variant="neon" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Nova Meta</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mockGoals.map((g) => (
          <Card key={g.name} className="border-border bg-surface relative overflow-hidden">
            {g.progress >= 100 && (
              <div className="absolute top-3 right-3">
                <Badge variant="success" className="text-[10px]">
                  Concluída 🎉
                </Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white">
                {g.name}
              </CardTitle>
              <p className="text-xs text-graphite-400">Prazo: {g.deadline}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xl font-bold text-white">
                  {formatCurrency(g.current)}
                </span>
                <span className="text-xs text-graphite-400">
                  de {formatCurrency(g.target)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-graphite-400">Progresso</span>
                  <span className="font-semibold text-neon font-mono">
                    {g.progress.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-graphite-900 border border-border">
                  <div
                    className="h-full rounded-full bg-neon shadow-neon-sm transition-all duration-500"
                    style={{ width: `${Math.min(g.progress, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

