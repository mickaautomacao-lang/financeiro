'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Download, Upload, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-neon" />
            Livro de Transações Contábeis
          </h2>
          <p className="text-xs text-graphite-400 mt-0.5">
            Histórico completo de entradas e saídas sincronizadas em tempo real com Supabase
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </Button>
          <Button variant="neon" size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Nova Linha</span>
          </Button>
        </div>
      </div>

      <TransactionTable />
    </DashboardLayout>
  );
}

