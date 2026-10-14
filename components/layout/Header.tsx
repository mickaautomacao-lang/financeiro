'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  X,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/context/FinanceContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = 'Visão Geral Financeira',
  subtitle = 'Rastreamento em tempo real • Planejado vs. Realizado',
}: HeaderProps) {
  const {
    searchTerm,
    setSearchTerm,
    selectedPeriod,
    setSelectedPeriod,
    refreshData,
    isRefreshing,
    alerts,
    setIsNewTransactionModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useFinance();

  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atalho global ⌘K / Ctrl+K para focar a barra de busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const periodLabels: { [key: string]: { full: string; short: string } } = {
    current_month: { full: 'Mês Atual (Outubro 2026)', short: 'Out 2026' },
    '2026-09': { full: 'Setembro 2026', short: 'Set 2026' },
    '2026-08': { full: 'Agosto 2026', short: 'Ago 2026' },
    all: { full: 'Todas as Datas', short: 'Tudo' },
  };

  const currentPeriod = periodLabels[selectedPeriod] || {
    full: selectedPeriod,
    short: selectedPeriod,
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Lado Esquerdo: Hamburger Button + Title */}
      <div className="flex items-center gap-3">
        {/* Botão Hamburger apenas em telas mobile/tablet (< lg) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-graphite-300 hover:text-white hover:bg-graphite-800 transition-colors"
          title="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-2 truncate">
            {title}
            <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-neon-sm flex-shrink-0" />
          </h1>
          <p className="hidden sm:block text-[11px] lg:text-xs text-graphite-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Lado Direito: Actions e Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar Desktop */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-graphite-400" />
          <Input
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar lançamentos..."
            className="pl-9 pr-12 text-xs bg-surface border-border focus:border-neon h-9"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-graphite-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded bg-graphite-800 px-1.5 font-mono text-[10px] font-medium text-graphite-400 sm:flex border border-border">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Botão de Busca Mobile */}
        <button
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-graphite-300 transition-colors hover:text-white"
          title="Pesquisar"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border bg-surface px-2.5 sm:px-3 py-2 text-xs font-medium text-graphite-200 transition-colors hover:border-graphite-500 hover:text-white h-9"
          >
            <Calendar className="h-3.5 w-3.5 text-neon flex-shrink-0" />
            <span className="hidden sm:inline">{currentPeriod.full}</span>
            <span className="sm:hidden">{currentPeriod.short}</span>
            <ChevronDown className="h-3.5 w-3.5 text-graphite-400 flex-shrink-0" />
          </button>

          {isPeriodMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-graphite-900 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {Object.entries(periodLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPeriod(key);
                    setIsPeriodMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === key
                      ? 'bg-neon-muted text-neon'
                      : 'text-graphite-300 hover:bg-surface hover:text-white'
                  }`}
                >
                  {label.full}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sync Button */}
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          title="Sincronizar dados"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-graphite-300 transition-colors hover:border-neon hover:text-neon disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-neon' : ''}`} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-graphite-300 transition-colors hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon text-[9px] font-bold text-graphite-950 shadow-neon-sm">
                {alerts.length}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-32px)] rounded-xl border border-border bg-graphite-900 p-3 shadow-2xl z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Notificações do Sistema
                </span>
                <span className="text-[10px] text-neon font-mono">
                  {alerts.length} ativas
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-graphite-400">
                  <CheckCircle2 className="h-8 w-8 text-neon/40 mx-auto mb-2" />
                  <p>Tudo sob controle!</p>
                  <p className="text-[10px] text-graphite-400 mt-0.5">
                    Nenhum alerta de orçamento ou vencimento pendente.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {alerts.map((al, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs ${
                        al.type === 'danger'
                          ? 'border-expense/40 bg-expense/10 text-red-200'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      }`}
                    >
                      <p className="font-semibold text-white">{al.title}</p>
                      <p className="text-[11px] text-graphite-300 mt-0.5">
                        {al.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botão "+ Nova Transação" Responsivo */}
        <Button
          variant="neon"
          size="sm"
          onClick={() => setIsNewTransactionModalOpen(true)}
          className="h-9 px-2.5 sm:px-3 text-xs font-semibold gap-1.5 shadow-neon-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Nova Transação</span>
          <span className="sm:hidden text-xs">Novo</span>
        </Button>
      </div>

      {/* Barra de Busca Expansível no Mobile */}
      {isMobileSearchOpen && (
        <div className="absolute top-16 left-0 right-0 p-3 bg-surface border-b border-border z-40 md:hidden animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-graphite-400" />
            <Input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, categoria ou método..."
              className="pl-9 pr-9 text-xs bg-graphite-900 border-border"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-graphite-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
