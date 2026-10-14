'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { ArrowLeftRight, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/context/FinanceContext';

function TransactionsContent() {
  const { setIsNewTransactionModalOpen, transactions } = useFinance();

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Nenhuma transação para exportar.');
      return;
    }
    const headers = 'ID,Data,Tipo,Valor,Descrição,Categoria,FormaPagamento,Status\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.date}","${t.type}","${t.amount}","${t.description.replace(/"/g, '""')}","${t.category?.name || 'Geral'}","${t.payment_method || ''}","${t.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
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
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </Button>
          <Button
            variant="neon"
            size="sm"
            onClick={() => setIsNewTransactionModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Nova Transação</span>
          </Button>
        </div>
      </div>

      <TransactionTable />
    </>
  );
}

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <TransactionsContent />
    </DashboardLayout>
  );
}
