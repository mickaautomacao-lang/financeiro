'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const mockCategoryData: CategoryData[] = [
  { name: 'Moradia & Contas', value: 2850, color: '#A3E635' }, // Neon
  { name: 'Alimentação & Mercado', value: 1684, color: '#FBBF24' }, // Âmbar
  { name: 'Transporte & Carro', value: 920, color: '#38BDF8' }, // Ciano
  { name: 'Lazer & Assinaturas', value: 780, color: '#A78BFA' }, // Roxo
  { name: 'Saúde & Farmácia', value: 540, color: '#F472B6' }, // Rosa
  { name: 'Outros Imprevistos', value: 785.8, color: '#64748B' }, // Slate
];

export function CategoryDonutChart() {
  const totalSpent = mockCategoryData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="border-border bg-surface flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">
            Gastos por Categoria
          </CardTitle>
          <span className="text-xs font-mono text-graphite-400">Outubro</span>
        </div>
        <p className="text-xs text-graphite-400">
          Distribuição proporcional das despesas
        </p>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col items-center">
        {/* Gráfico de Rosca com Total Centralizado */}
        <div className="relative h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryData;
                    const percent = ((data.value / totalSpent) * 100).toFixed(1);
                    return (
                      <div className="rounded-xl border border-border bg-graphite-900 p-2.5 shadow-xl text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="font-semibold text-white">{data.name}</span>
                        </div>
                        <p className="text-graphite-300">
                          {formatCurrency(data.value)} ({percent}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={mockCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                stroke="#13151D"
                strokeWidth={2}
              >
                {mockCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Rótulo Centralizado */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-wider text-graphite-400">
              Total Gasto
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {formatCurrency(totalSpent)}
            </span>
          </div>
        </div>

        {/* Lista resumida de legendas com badges */}
        <div className="w-full space-y-1.5 mt-2">
          {mockCategoryData.slice(0, 4).map((cat) => {
            const percent = ((cat.value / totalSpent) * 100).toFixed(0);
            return (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-graphite-300 truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="text-graphite-400">{percent}%</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(cat.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

