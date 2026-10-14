'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Transaction,
  Category,
  Debt,
  Goal,
  BudgetComparison,
  KPISummary,
} from '@/types/database.types';

export interface AlertItem {
  type: 'warning' | 'danger' | 'success';
  title: string;
  description: string;
  badge: string;
  time: string;
}

interface FinanceContextType {
  kpi: KPISummary;
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetComparison[];
  debts: Debt[];
  goals: Goal[];
  cashFlowData: Array<{ day: string; receitas: number; despesas: number }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  alerts: AlertItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isNewTransactionModalOpen: boolean;
  setIsNewTransactionModalOpen: (open: boolean) => void;
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;
  categoryToEdit: Category | null;
  setCategoryToEdit: (cat: Category | null) => void;
  openCategoryModal: (cat?: Category | null) => void;
  isNotificationDropdownOpen: boolean;
  setIsNotificationDropdownOpen: (open: boolean) => void;
  refreshData: () => Promise<void>;
  deleteTransaction: (id: string) => Promise<boolean>;
}

const emptyKPI: KPISummary = {
  netRevenue: 0,
  totalIncome: 0,
  totalExpenses: 0,
  currentBalance: 0,
  emergencyFundProgress: 0,
  totalInvestedOrGoals: 0,
  pendingDebtsTotal: 0,
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [kpi, setKpi] = useState<KPISummary>(emptyKPI);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetComparison[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cashFlowData, setCashFlowData] = useState<
    Array<{ day: string; receitas: number; despesas: number }>
  >([]);
  const [categoryDistribution, setCategoryDistribution] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const openCategoryModal = (cat?: Category | null) => {
    setCategoryToEdit(cat || null);
    setIsCategoryModalOpen(true);
  };

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const res = await fetch(`/api/finance/overview?period=${encodeURIComponent(selectedPeriod)}`);
        const data = await res.json();

        if (data.success) {
          setKpi(data.kpi || emptyKPI);
          setTransactions(data.transactions || []);
          setCategories(data.categories || []);
          setBudgets(data.budgets || []);
          setDebts(data.debts || []);
          setGoals(data.goals || []);
          setCashFlowData(data.cashFlowData || []);
          setCategoryDistribution(data.categoryDistribution || []);
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        console.error('[FinanceContext] Falha ao carregar dados:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedPeriod]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = async () => {
    await fetchData(true);
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/finance/transactions?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        kpi,
        transactions,
        categories,
        budgets,
        debts,
        goals,
        cashFlowData,
        categoryDistribution,
        alerts,
        isLoading,
        isRefreshing,
        selectedPeriod,
        setSelectedPeriod,
        searchTerm,
        setSearchTerm,
        isNewTransactionModalOpen,
        setIsNewTransactionModalOpen,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        categoryToEdit,
        setCategoryToEdit,
        openCategoryModal,
        isNotificationDropdownOpen,
        setIsNotificationDropdownOpen,
        refreshData,
        deleteTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser utilizado dentro de um FinanceProvider');
  }
  return context;
}

