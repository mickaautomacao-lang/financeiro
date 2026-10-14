'use client';

import React from 'react';
import {
  Search,
  Bell,
  Plus,
  Calendar,
  ChevronDown,
  RefreshCw,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNewTransaction?: () => void;
}

export function Header({
  title = 'Visão Geral Financeira',
  subtitle = 'Rastreamento em tempo real • Planejado vs. Realizado',
  onNewTransaction,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-8 backdrop-blur-md">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          {title}
          <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-neon-sm" />
        </h1>
        <p className="text-xs text-graphite-400">{subtitle}</p>
      </div>

      {/* Actions and Controls */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-graphite-400" />
          <Input
            placeholder="Buscar transação, categoria..."
            className="pl-9 pr-12 text-xs bg-surface border-border focus:border-neon"
          />
          <kbd className="absolute right-2.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded bg-graphite-800 px-1.5 font-mono text-[10px] font-medium text-graphite-400 sm:flex border border-border">
            ⌘K
          </kbd>
        </div>

        {/* Date Filter Dropdown */}
        <button className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-graphite-200 transition-colors hover:border-graphite-500 hover:text-white">
          <Calendar className="h-3.5 w-3.5 text-neon" />
          <span>Outubro 2026</span>
          <ChevronDown className="h-3.5 w-3.5 text-graphite-400" />
        </button>

        {/* Sync Trigger Button */}
        <button
          title="Forçar sincronização n8n"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-graphite-300 transition-colors hover:border-neon hover:text-neon"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-graphite-300 transition-colors hover:text-white">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon text-[9px] font-bold text-graphite-950 shadow-neon-sm">
              3
            </span>
          </button>
        </div>

        {/* Primary Action Button */}
        <Button
          variant="neon"
          size="sm"
          onClick={onNewTransaction}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Nova Transação</span>
        </Button>
      </div>
    </header>
  );
}

