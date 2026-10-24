'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderEdit, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/context/FinanceContext';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroupName: string;
}

export function EditGroupModal({
  isOpen,
  onClose,
  currentGroupName,
}: EditGroupModalProps) {
  const { refreshData } = useFinance();
  const [newGroupName, setNewGroupName] = useState(currentGroupName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewGroupName(currentGroupName);
    setError(null);
  }, [currentGroupName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = newGroupName.trim();
    if (!trimmed) {
      setError('Por favor, informe o novo nome da gaveta.');
      return;
    }

    if (trimmed === currentGroupName.trim()) {
      onClose();
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/finance/categories/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_group: currentGroupName,
          new_group: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao renomear gaveta.');
      }

      await refreshData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha na conexão ao renomear.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/70 bg-graphite-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center text-neon">
              <FolderEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Renomear Gaveta Orçamentária
              </h3>
              <p className="text-xs text-graphite-400">
                Altere o nome da gaveta para personalizar seu centro de custos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-expense/10 border border-expense/20 flex items-center gap-2.5 text-xs text-expense">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1.5">
              Nome Atual da Gaveta
            </label>
            <div className="px-3 py-2 rounded-xl bg-graphite-900 border border-border/60 text-xs text-graphite-400 font-medium">
              {currentGroupName}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1.5">
              Novo Nome Desejado *
            </label>
            <input
              type="text"
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Ex: Casa, Moradia, Despesas do Lar..."
              className="w-full px-3.5 py-2.5 bg-graphite-900 border border-border rounded-xl text-sm text-white placeholder-graphite-600 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              autoFocus
            />
            <p className="text-[11px] text-graphite-500 mt-1.5">
              Todas as subcontas vinculadas a esta gaveta passarão a adotar este novo título imediatamente.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="border-border text-graphite-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-neon text-graphite-950 font-bold hover:bg-neon/90 gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Alteração</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

