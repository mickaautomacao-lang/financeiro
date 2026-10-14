'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RightSidebar } from './RightSidebar';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { NewTransactionModal } from '@/components/dashboard/NewTransactionModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const {
    isNewTransactionModalOpen,
    setIsNewTransactionModalOpen,
    categories,
    refreshData,
  } = useFinance();

  return (
    <div className="min-h-screen bg-background text-graphite-100 flex">
      {/* 1. Sidebar de Navegação Fixa à Esquerda */}
      <Sidebar />

      {/* 2. Área Central e Conteúdo */}
      <div className="flex flex-1 flex-col pl-64 transition-all duration-200">
        <Header />

        <div className="flex flex-1">
          {/* Conteúdo Principal do Dashboard */}
          <main className="flex-1 p-8 overflow-y-auto max-w-[1440px] space-y-8">
            {children}
          </main>

          {/* 3. Barra Lateral Direita de Notificações e Atividades */}
          <RightSidebar />
        </div>
      </div>

      {/* Modal Interativo de Nova Transação */}
      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        categories={categories}
        onSuccess={refreshData}
      />
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <FinanceProvider>
      <DashboardContent>{children}</DashboardContent>
    </FinanceProvider>
  );
}
