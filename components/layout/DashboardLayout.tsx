'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RightSidebar } from './RightSidebar';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { NewTransactionModal } from '@/components/dashboard/NewTransactionModal';
import { CategoryModal } from '@/components/dashboard/CategoryModal';
import { CategoryInstallmentsModal } from '@/components/dashboard/CategoryInstallmentsModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const {
    isNewTransactionModalOpen,
    setIsNewTransactionModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categoryToEdit,
    categories,
    isInstallmentsModalOpen,
    setIsInstallmentsModalOpen,
    selectedCategoryForInstallments,
    refreshData,
  } = useFinance();

  return (
    <div className="min-h-screen bg-background text-graphite-100 flex">
      {/* 1. Sidebar de Navegação Fixa à Esquerda */}
      <Sidebar />

      {/* 2. Área Central e Conteúdo Responsivo */}
      <div className="flex flex-1 flex-col pl-0 lg:pl-64 transition-all duration-200 w-full min-w-0">
        <Header />

        <div className="flex flex-1 min-w-0">
          {/* Conteúdo Principal do Dashboard */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1440px] space-y-6 sm:space-y-8 w-full min-w-0">
            {children}
          </main>

          {/* 3. Barra Lateral Direita de Notificações e Atividades (Desktop) */}
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

      {/* Modal de Nova / Editar Categoria & Orçamento */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onSuccess={refreshData}
      />

      {/* Modal de Detalhamento de Parcelas & Compras da Categoria */}
      <CategoryInstallmentsModal
        isOpen={isInstallmentsModalOpen}
        onClose={() => setIsInstallmentsModalOpen(false)}
        category={selectedCategoryForInstallments}
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
