'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';

function GoalsContent() {
  const { goals } = useFinance();

  return (
    <>
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
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span>Nova Meta</span>
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="border-border bg-surface p-12 text-center">
          <Target className="h-12 w-12 text-neon/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma meta cadastrada</h3>
          <p className="text-xs text-graphite-400 max-w-sm mx-auto mt-1 mb-4">
            Defina metas como Reserva de Emergência, Aquisição de Bens ou Aportes de Longo Prazo.
          </p>
          <Button variant="neon" size="sm" className="text-xs">
            Criar Minha Primeira Meta
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {goals.map((g) => {
            const current = Number(g.current_amount) || 0;
            const target = Number(g.target_amount) || 1;
            const progress = Math.min(100, (current / target) * 100);

            return (
              <Card key={g.id} className="border-border bg-surface relative overflow-hidden">
                {progress >= 100 && (
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
                  <p className="text-xs text-graphite-400">
                    Prazo: {g.deadline || 'Indeterminado'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(current)}
                    </span>
                    <span className="text-xs text-graphite-400">
                      de {formatCurrency(target)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-graphite-400">Progresso</span>
                      <span className="font-semibold text-neon font-mono">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-graphite-900 border border-border">
                      <div
                        className="h-full rounded-full bg-neon shadow-neon-sm transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
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

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <GoalsContent />
    </DashboardLayout>
  );
}
