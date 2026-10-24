'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  QrCode,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateBR } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import type { Transaction } from '@/types/database.types';

type SortField = 'date' | 'amount' | 'description';
type SortOrder = 'asc' | 'desc';

export function TransactionTable() {
  const {
    transactions,
    searchTerm,
    setSearchTerm,
    deleteTransaction,
    toggleTransactionStatus,
    setIsNewTransactionModalOpen,
  } = useFinance();

  const [updatingTxId, setUpdatingTxId] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
    return transactions
      .filter((t) => {
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesSearch =
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'date') {
          comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'amount') {
          comp = Number(a.amount) - Number(b.amount);
        } else if (sortField === 'description') {
          comp = (a.description || '').localeCompare(b.description || '');
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [transactions, searchTerm, filterType, sortField, sortOrder]);

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
            Sincronização em tempo real via Telegram Bot, Webhooks e lançamentos manuais
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
        {filteredAndSorted.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-graphite-900 border border-border flex items-center justify-center text-graphite-500">
              <ArrowDownLeft className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Nenhuma transação encontrada
              </p>
              <p className="text-xs text-graphite-400 mt-0.5 max-w-sm">
                Envie um gasto no Telegram <code>@dashfina_bot</code> ou clique no botão abaixo para adicionar sua primeira transação.
              </p>
            </div>
            <Button
              variant="neon"
              size="sm"
              onClick={() => setIsNewTransactionModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nova Transação</span>
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[620px] text-left text-xs text-graphite-200">
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
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3 text-neon" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-neon" />
                      )
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
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3 text-neon" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-neon" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Ações</th>
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
                        <div className="flex items-center gap-1.5 text-[11px] text-graphite-400 flex-wrap">
                          <span>{tx.payment_method || 'Pix'}</span>
                          {tx.pix_key && (
                            <span className="text-[10px] text-purple-300 bg-purple-500/15 px-1.5 py-0.2 rounded border border-purple-500/30 font-mono">
                              Pix: {tx.pix_key}
                            </span>
                          )}
                          {tx.payment_info && (
                            <span className="text-[10px] text-blue-300 bg-blue-500/15 px-1.5 py-0.2 rounded border border-blue-500/30">
                              {tx.payment_info}
                            </span>
                          )}
                        </div>
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
                      {tx.source === 'telegram_bot'
                        ? 'Telegram Bot'
                        : tx.source === 'google_sheets'
                        ? 'Sheets Sync'
                        : tx.source === 'n8n_sync'
                        ? 'n8n Autom'
                        : 'Manual Web'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4">
                    {tx.status === 'pending' ? (
                      <button
                        type="button"
                        disabled={updatingTxId === tx.id}
                        onClick={async () => {
                          setUpdatingTxId(tx.id);
                          await toggleTransactionStatus(tx.id, 'completed');
                          setUpdatingTxId(null);
                        }}
                        title="Clique para confirmar pagamento / saída"
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-sm transition-all flex items-center gap-1 animate-pulse"
                      >
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Confirmar Saída</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={updatingTxId === tx.id}
                        onClick={async () => {
                          setUpdatingTxId(tx.id);
                          await toggleTransactionStatus(tx.id, 'pending');
                          setUpdatingTxId(null);
                        }}
                        title="Clique para alternar para Pendente"
                        className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Pago</span>
                      </button>
                    )}
                  </td>

                  <td className="py-3.5 px-5 text-right font-mono font-semibold">
                    <span
                      className={
                        tx.type === 'income' ? 'text-income' : 'text-graphite-100'
                      }
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Excluir transação"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-graphite-400 hover:text-expense hover:bg-expense/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>

      {/* Paginação */}
      {filteredAndSorted.length > 0 && (
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
      )}
    </Card>
  );
}
