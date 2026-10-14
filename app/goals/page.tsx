'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Pencil, TrendingUp, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { GoalModal } from '@/components/dashboard/GoalModal';
import type { Goal } from '@/types/database.types';

function GoalsContent() {
  const { goals, refreshData } = useFinance();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const handleOpenNew = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const totalTarget = goals.reduce(
    (acc, g) => acc + (parseFloat(String(g.target_amount)) || 0),
    0
  );
  const totalAccumulated = goals.reduce(
    (acc, g) => acc + (parseFloat(String(g.current_amount)) || 0),
    0
  );
  const overallProgress = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-neon" />
            Metas & Reserva Financeira
          </h2>
          <p className="text-xs text-graphite-400 mt-0.5">
            Acompanhe o acúmulo de patrimônio, reserva de emergência e objetivos de curto e longo prazo
          </p>
        </div>

        <Button
          onClick={handleOpenNew}
          variant="neon"
          size="sm"
          className="gap-1.5 text-xs font-semibold shadow-neon-sm"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span>Nova Meta</span>
        </Button>
      </div>

      {/* KPI Cards Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-neon/10 text-neon">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Total Já Acumulado
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {formatCurrency(totalAccumulated)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Objetivo Global Total
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {formatCurrency(totalTarget)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-graphite-400 font-medium uppercase tracking-wider">
                Progresso Médio
              </p>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {overallProgress.toFixed(1)}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listagem de Metas */}
      {goals.length === 0 ? (
        <Card className="border-border bg-surface p-12 text-center">
          <Target className="h-12 w-12 text-neon/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma meta cadastrada</h3>
          <p className="text-xs text-graphite-400 max-w-sm mx-auto mt-1 mb-5">
            Defina metas como Reserva de Emergência, Aquisição de Bens ou Aportes de Longo Prazo para acompanhar sua evolução patrimonial.
          </p>
          <Button
            onClick={handleOpenNew}
            variant="neon"
            size="sm"
            className="text-xs font-semibold shadow-neon-sm"
          >
            Criar Minha Primeira Meta
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const current = Number(g.current_amount) || 0;
            const target = Number(g.target_amount) || 1;
            const progress = Math.min(100, (current / target) * 100);
            const isCompleted = progress >= 100 || g.status === 'completed';

            return (
              <Card
                key={g.id}
                className="border-border bg-surface relative overflow-hidden flex flex-col justify-between hover:border-graphite-600 transition-all group"
              >
                <div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-neon/15 text-neon flex items-center justify-center">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold text-white">
                            {g.name}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 text-[11px] text-graphite-400 mt-0.5">
                            <Calendar className="w-3 h-3 text-graphite-500" />
                            <span>Prazo: {g.deadline || 'Indeterminado'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCompleted && (
                          <Badge variant="success" className="text-[10px] py-0">
                            Concluída 🎉
                          </Badge>
                        )}
                        <button
                          onClick={() => handleOpenEdit(g)}
                          title="Editar Meta"
                          className="p-1 rounded text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-2">
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-xl font-bold text-white">
                        {formatCurrency(current)}
                      </span>
                      <span className="text-xs text-graphite-400">
                        de {formatCurrency(target)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
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
                </div>

                <div className="px-6 pb-4 pt-1">
                  <Button
                    onClick={() => handleOpenEdit(g)}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-graphite-300 hover:text-white hover:border-graphite-500 border-border"
                  >
                    Editar / Adicionar Aporte
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Interativo de Metas */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
        onSuccess={refreshData}
      />
    </div>
  );
}

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <GoalsContent />
    </DashboardLayout>
  );
}
