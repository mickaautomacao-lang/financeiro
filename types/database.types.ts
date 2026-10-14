/**
 * Tipagens TypeScript para o Sistema de Controle Financeiro Pessoal
 * Compatível com o SDK do Supabase (@supabase/supabase-js)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';
export type GoalStatus = 'in_progress' | 'completed' | 'paused';
export type DebtStatus = 'active' | 'paid' | 'negotiating';

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          budget_limit: number;
          category_type?: 'fixed' | 'credit_card' | 'variable';
          category_nature?: 'expense' | 'income' | 'both';
          due_day?: number | null;
          closing_day?: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          icon?: string;
          budget_limit?: number;
          category_type?: 'fixed' | 'credit_card' | 'variable';
          category_nature?: 'expense' | 'income' | 'both';
          due_day?: number | null;
          closing_day?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string;
          budget_limit?: number;
          category_type?: 'fixed' | 'credit_card' | 'variable';
          category_nature?: 'expense' | 'income' | 'both';
          due_day?: number | null;
          closing_day?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          category_id: string | null;
          date: string;
          status: TransactionStatus;
          description: string;
          payment_method: string | null;
          source: string | null;
          entry_subtype?: string | null;
          installments_count?: number | null;
          installment_number?: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: TransactionType;
          category_id?: string | null;
          date?: string;
          status?: TransactionStatus;
          description: string;
          payment_method?: string | null;
          source?: string | null;
          entry_subtype?: string | null;
          installments_count?: number | null;
          installment_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: TransactionType;
          category_id?: string | null;
          date?: string;
          status?: TransactionStatus;
          description?: string;
          payment_method?: string | null;
          source?: string | null;
          entry_subtype?: string | null;
          installments_count?: number | null;
          installment_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          deadline: string | null;
          status: GoalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          deadline?: string | null;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          deadline?: string | null;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'goals_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      debts: {
        Row: {
          id: string;
          user_id: string;
          creditor: string;
          total_amount: number;
          remaining_amount: number;
          interest_rate: number;
          due_date: string;
          status: DebtStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          creditor: string;
          total_amount: number;
          remaining_amount: number;
          interest_rate?: number;
          due_date: string;
          status?: DebtStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          creditor?: string;
          total_amount?: number;
          remaining_amount?: number;
          interest_rate?: number;
          due_date?: string;
          status?: DebtStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'debts_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      v_budget_vs_actual: {
        Row: {
          user_id: string;
          category_id: string;
          category_name: string;
          category_color: string;
          planned_amount: number;
          actual_spent: number;
          remaining_budget: number;
          percentage_used: number;
          alert_threshold_reached: boolean;
        };
      };
    };
  };
}

// ==============================================================================
// Domain Models para uso direto no Frontend (Next.js / React)
// ==============================================================================

export type Category = Database['public']['Tables']['categories']['Row'];
export type NewCategory = Database['public']['Tables']['categories']['Insert'];

export type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  category?: Pick<Category, 'name' | 'color' | 'icon'> | null;
};
export type NewTransaction = Database['public']['Tables']['transactions']['Insert'];

export type Goal = Database['public']['Tables']['goals']['Row'];
export type NewGoal = Database['public']['Tables']['goals']['Insert'];

export type Debt = Database['public']['Tables']['debts']['Row'];
export type NewDebt = Database['public']['Tables']['debts']['Insert'];

export type BudgetComparison = Database['public']['Views']['v_budget_vs_actual']['Row'];

export interface KPISummary {
  netRevenue: number;         // Receita Líquida (Entradas - Saídas)
  totalIncome: number;        // Total de Entradas
  totalExpenses: number;      // Total de Saídas
  currentBalance: number;     // Saldo em Conta
  emergencyFundProgress: number; // Progresso da reserva (%)
  totalInvestedOrGoals: number;  // Valor acumulado em Metas
  pendingDebtsTotal: number;  // Total de dívidas pendentes
}

export interface CategoryInstallment {
  id: string;
  user_id: string;
  category_id: string;
  description: string;
  installment_amount: number;
  total_installments: number;
  current_installment: number;
  due_day?: number;
  start_date: string;
  purchase_date?: string | null;
  status: 'active' | 'completed' | 'paused';
  notes?: string | null;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, 'name' | 'color' | 'icon'> | null;
}


