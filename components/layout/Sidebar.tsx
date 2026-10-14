'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  LineChart,
  ArrowLeftRight,
  PieChart,
  Target,
  CreditCard,
  Settings,
  Zap,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isActive?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, isActive: true },
  { label: 'Analytics', href: '/analytics', icon: LineChart },
  { label: 'Transações', href: '/transactions', icon: ArrowLeftRight, badge: 'Auto' },
  { label: 'Orçamentos', href: '/budgets', icon: PieChart },
  { label: 'Metas & Reserva', href: '/goals', icon: Target },
  { label: 'Dívidas & Contas', href: '/debts', icon: CreditCard, badge: '2' },
  { label: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-surface/95 backdrop-blur-md">
      {/* Brand / Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon shadow-neon-sm transition-transform duration-200 group-hover:scale-105">
            <Zap className="h-5 w-5 text-graphite-950 fill-graphite-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">
                Fin<span className="text-neon">Pulse</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neon bg-neon-muted px-1.5 py-0.5 rounded border border-neon/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-graphite-400">Controle de Precisão</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-graphite-400 mb-2">
            Menu Principal
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    item.isActive
                      ? 'bg-neon-muted text-neon border-l-2 border-neon font-semibold'
                      : 'text-graphite-300 hover:bg-surface-hover hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        item.isActive
                          ? 'text-neon drop-shadow-[0_0_8px_rgba(163,230,53,0.6)]'
                          : 'text-graphite-400 group-hover:text-white'
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.isActive ? 'neon' : 'neutral'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sync Status Card */}
        <div className="rounded-xl border border-border bg-graphite-900/60 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon" />
              </span>
              <span className="text-xs font-medium text-graphite-200">
                n8n Live Engine
              </span>
            </div>
            <span className="text-[10px] text-neon font-mono">ONLINE</span>
          </div>
          <p className="mt-1.5 text-[11px] text-graphite-400">
            Sincronização com Google Sheets e Telegram ativa.
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hover">
          <Avatar className="h-9 w-9 border-neon/30">
            <AvatarFallback>FS</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col truncate">
            <span className="text-xs font-semibold text-white truncate">
              Engenheiro Sênior
            </span>
            <span className="text-[11px] text-graphite-400 truncate">
              finance@antigravity.io
            </span>
          </div>
          <ShieldCheck className="h-4 w-4 text-neon" />
        </div>
      </div>
    </aside>
  );
}

