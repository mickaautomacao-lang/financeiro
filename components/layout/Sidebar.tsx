'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  ArrowLeftRight,
  PieChart,
  Target,
  CreditCard,
  Settings,
  Zap,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';

export function Sidebar() {
  const pathname = usePathname();
  const { debts, isMobileMenuOpen, setIsMobileMenuOpen } = useFinance();

  const nearDueDebtsCount = debts.filter((d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = d.due_date.split('-');
    const dueDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const diffDays = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 3;
  }).length;

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: LineChart },
    { label: 'Transações', href: '/transactions', icon: ArrowLeftRight, badge: 'Auto' },
    { label: 'Orçamentos', href: '/budgets', icon: PieChart },
    { label: 'Metas & Reserva', href: '/goals', icon: Target },
    {
      label: 'Dívidas & Contas',
      href: '/debts',
      icon: CreditCard,
      badge: nearDueDebtsCount > 0 ? String(nearDueDebtsCount) : undefined,
    },
    { label: 'Configurações', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop para Mobile quando o drawer estiver aberto */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Principal (Off-canvas no mobile, fixo no desktop) */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 group"
          >
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

          {/* Botão de Fechar no Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
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
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-neon-muted text-neon border-l-2 border-neon font-semibold'
                        : 'text-graphite-300 hover:bg-surface-hover hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive
                            ? 'text-neon'
                            : 'text-graphite-400 group-hover:text-neon'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <Badge
                        variant={isActive ? 'neon' : 'neutral'}
                        className="text-[10px] py-0 px-1.5 font-mono"
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
              Bot @dashfina_bot e Vercel sincronizados.
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
                Administrador
              </span>
              <span className="text-[11px] text-graphite-400 truncate">
                mickaautomacao@gmail.com
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-neon" />
          </div>
        </div>
      </aside>
    </>
  );
}
