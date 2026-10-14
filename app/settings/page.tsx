'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, ShieldCheck, Database, Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-neon" />
          Configurações do Sistema & Integrações
        </h2>
        <p className="text-xs text-graphite-400 mt-0.5">
          Conexões com Supabase PostgreSQL, Telegram Bot API e Webhooks do n8n
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supabase Status */}
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-neon" />
                Supabase PostgreSQL (Ativo)
              </CardTitle>
              <Badge variant="neon" className="text-[10px]">CONECTADO</Badge>
            </div>
            <p className="text-xs text-graphite-400">
              Projeto: <code>yjzmheubgqhlmuprbabp</code>
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-graphite-400">Instância:</span>
              <span className="font-mono text-graphite-200">yjzmheubgqhlmuprbabp.supabase.co</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-graphite-400">Segurança RLS:</span>
              <span className="text-neon font-semibold">16 Políticas Ativas</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-graphite-400">View Analítica:</span>
              <span className="text-white font-mono">v_budget_vs_actual</span>
            </div>
          </CardContent>
        </Card>

        {/* Telegram Bot */}
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-neon" />
                Alertas Telegram
              </CardTitle>
              <Badge variant="warning" className="text-[10px]">AGUARDANDO TOKEN</Badge>
            </div>
            <p className="text-xs text-graphite-400">
              Canal de disparo para notificações imediatas
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-graphite-400 block mb-1">Telegram Bot Token</label>
              <Input
                placeholder="Insira o token obtido no @BotFather"
                className="text-xs bg-graphite-900 border-border"
              />
            </div>
            <Button variant="neon" size="sm" className="w-full text-xs">
              Salvar Credencial do Telegram
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

