'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateBR } from '@/lib/utils';
import type { Transaction } from '@/types/database.types';

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'user-1',
    amount: 6500.0,
    type: 'income',
    category_id: 'cat-inc-1',
    category: { name: 'Consultoria Dev', color: '#4ADE80', icon: 'Code' },
    date: '2026-10-12',
    status: 'completed',
    description: 'Pagamento Projeto Next.js & IA',
    payment_method: 'Pix',
    source: 'google_sheets',
    created_at: '2026-10-12T14:30:00Z',
    updated_at: '2026-10-12T14:30:00Z',
  },
  {
    id: 'tx-2',
    user_id: 'user-1',
    amount: 482.3,
    type: 'expense',
    category_id: 'cat-exp-1',
    category: { name: 'Alimentação & Mercado', color: '#FBBF24', icon: 'ShoppingCart' },
    date: '2026-10-12',
    status: 'completed',
    description: 'Supermercado Pão de Açúcar',
    payment_method: 'Cartão Débito',
    source: 'manual',
    created_at: '2026-10-12T18:12:00Z',
    updated_at: '2026-10-12T18:12:00Z',
  },
  {
    id: 'tx-3',
    user_id: 'user-1',
    amount: 120.0,
    type: 'expense',
    category_id: 'cat-exp-2',
    category: { name: 'Lazer & Streaming', color: '#A78BFA', icon: 'Tv' },
    date: '2026-10-11',
    status: 'completed',
    description: 'Assinaturas Digitais (Netflix & Spotify)',
    payment_method: 'Cartão Crédito',
    source: 'google_sheets',
    created_at: '2026-10-11T09:00:00Z',
    updated_at: '2026-10-11T09:00:00Z',
  },
  {
    id: 'tx-4',
    user_id: 'user-1',
    amount: 3200.0,
    type: 'expense',
    category_id: 'cat-exp-3',
    category: { name: 'Moradia & Contas', color: '#A3E635', icon: 'Home' },
    date: '2026-10-10',
    status: 'completed',
    description: 'Aluguel & Taxa Condominial',
    payment_method: 'Boleto',
    source: 'n8n_sync',
    created_at: '2026-10-10T10:15:00Z',
    updated_at: '2026-10-10T10:15:00Z',
  },
  {
    id: 'tx-5',
    user_id: 'user-1',
    amount: 8500.0,
    type: 'income',
    category_id: 'cat-inc-2',
    category: { name: 'Salário Tech', color: '#4ADE80', icon: 'Briefcase' },
    date: '2026-10-05',
    status: 'completed',
    description: 'Remuneração Mensal PJ',
    payment_method: 'TED',
    source: 'google_sheets',
    created_at: '2026-10-05T08:00:00Z',
    updated_at: '2026-10-05T08:00:00Z',
  },
  {
    id: 'tx-6',
    user_id: 'user-1',
    amount: 350.0,
    type: 'expense',
    category_id: 'cat-exp-4',
    category: { name: 'Transporte & Carro', color: '#38BDF8', icon: 'Fuel' },
    date: '2026-10-04',
    status: 'completed',
    description: 'Abastecimento Posto Ipiranga',
    payment_method: 'Pix',
    source: 'manual',
    created_at: '2026-10-04T17:40:00Z',
    updated_at: '2026-10-04T17:40:00Z',
  },
  {
    id: 'tx-7',
    user_id: 'user-1',
    amount: 1500.0,
    type: 'expense',
    category_id: 'cat-exp-5',
    category: { name: 'Investimento / Metas', color: '#2DD4BF', icon: 'TrendingUp' },
    date: '2026-10-03',
    status: 'completed',
    description: 'Aporte Reserva de Emergência Selic',
    payment_method: 'Pix',
    source: 'n8n_sync',
    created_at: '2026-10-03T11:20:00Z',
    updated_at: '2026-10-03T11:20:00Z',
  },
  {
    id: 'tx-8',
    user_id: 'user-1',
    amount: 290.0,
    type: 'expense',
    category_id: 'cat-exp-6',
    category: { name: 'Saúde & Farmácia', color: '#F472B6', icon: 'Heart' },
    date: '2026-10-02',
    status: 'pending',
    description: 'Consulta Especialista Oftalmologia',
    payment_method: 'Cartão Crédito',
    source: 'manual',
    created_at: '2026-10-02T16:00:00Z',
    updated_at: '2026-10-02T16:00:00Z',
  },
];

type SortField = 'date' | 'amount' | 'description';
type SortOrder = 'asc' | 'desc';

export function TransactionTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtragem e Ordenação
  const filteredAndSorted = useMemo(() => {
    return mockTransactions
      .filter((t) => {
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesSearch =
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'date') {
          comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'amount') {
          comp = a.amount - b.amount;
        } else if (sortField === 'description') {
          comp = a.description.localeCompare(b.description);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [searchTerm, filterType, sortField, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  return (
    <Card className="border-border bg-surface">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            Transações Financeiras Detalhadas
            <Badge variant="neutral" className="text-[10px] font-mono">
              {filteredAndSorted.length} registros
            </Badge>
          </CardTitle>
          <p className="text-xs text-graphite-400 mt-0.5">
            Histórico contábil com sincronização bidirecional (Google Sheets & Supabase)
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-graphite-400" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filtrar transações..."
              className="h-8 pl-8 text-xs bg-graphite-900 border-border"
            />
          </div>

          <div className="flex rounded-lg border border-border bg-graphite-900 p-0.5 text-xs">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-surface text-neon shadow-sm'
                    : 'text-graphite-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'Todas' : type === 'income' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs text-graphite-200">
          <thead className="border-y border-border bg-graphite-900/60 uppercase font-semibold text-[10px] tracking-wider text-graphite-400">
            <tr>
              <th
                className="py-3 px-5 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Descrição / Detalhes</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4">Categoria</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Data</span>
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-neon" /> : <ArrowDown className="h-3 w-3 text-neon" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th className="py-3 px-4">Origem</th>
              <th className="py-3 px-4">Status</th>
              <th
                className="py-3 px-5 text-right cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Valor</span>
                  {sortField === 'amount' ? (
                    sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-neon" /> : <ArrowDown className="h-3 w-3 text-neon" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginatedTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-surface-hover/70 transition-colors group"
              >
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        tx.type === 'income'
                          ? 'bg-income-muted text-income'
                          : 'bg-expense-muted text-expense'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-neon transition-colors">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-graphite-400">
                        {tx.payment_method || 'Pix'}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tx.category?.color || '#A3E635' }}
                    />
                    <span className="font-medium text-graphite-200">
                      {tx.category?.name || 'Geral'}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-graphite-300">
                  {formatDateBR(tx.date)}
                </td>

                <td className="py-3.5 px-4">
                  <Badge variant="neutral" className="text-[10px] px-2 py-0.5">
                    {tx.source === 'google_sheets'
                      ? 'Sheets Sync'
                      : tx.source === 'n8n_sync'
                      ? 'n8n Autom'
                      : 'Manual'}
                  </Badge>
                </td>

                <td className="py-3.5 px-4">
                  <Badge
                    variant={
                      tx.status === 'completed'
                        ? 'success'
                        : tx.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                    className="text-[10px] capitalize"
                  >
                    {tx.status === 'completed'
                      ? 'Concluído'
                      : tx.status === 'pending'
                      ? 'Pendente'
                      : 'Cancelado'}
                  </Badge>
                </td>

                <td className="py-3.5 px-5 text-right font-mono font-semibold">
                  <span
                    className={
                      tx.type === 'income' ? 'text-income' : 'text-graphite-100'
                    }
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      {/* Paginação */}
      <CardFooter className="flex items-center justify-between border-t border-border py-3 px-5">
        <span className="text-xs text-graphite-400">
          Página <strong className="text-white">{currentPage}</strong> de{' '}
          <strong className="text-white">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex h-8 items-center gap-1 rounded-lg border border-border bg-graphite-900 px-3 text-xs font-medium text-graphite-300 transition-colors hover:border-graphite-500 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Anterior</span>
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex h-8 items-center gap-1 rounded-lg border border-border bg-graphite-900 px-3 text-xs font-medium text-graphite-300 transition-colors hover:border-graphite-500 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Próxima</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

