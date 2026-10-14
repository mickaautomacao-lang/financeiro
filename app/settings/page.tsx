'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Send, ExternalLink, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-neon" />
          Configurações do Sistema & Integrações
        </h2>
        <p className="text-xs text-graphite-400 mt-0.5">
          Conexões em tempo real com Supabase PostgreSQL, Telegram Bot e n8n Workflow
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
                Bot Telegram Oficial
              </CardTitle>
              <Badge variant="neon" className="text-[10px]">100% OPERACIONAL</Badge>
            </div>
            <p className="text-xs text-graphite-400">
              Automação e captura de despesas via n8n
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-graphite-400">Nome do Bot:</span>
              <span className="font-semibold text-white">dash_financeiro</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-graphite-400">Usuário:</span>
              <span className="font-mono text-neon font-semibold">@dashfina_bot</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-graphite-400">Status do Webhook:</span>
              <span className="text-income font-medium">Ativo no n8n</span>
            </div>
            <div className="pt-2">
              <a
                href="https://t.me/dashfina_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="neon" size="sm" className="w-full text-xs gap-1.5">
                  <Bot className="h-3.5 w-3.5" />
                  <span>Abrir @dashfina_bot no Telegram</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
