import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

/**
 * Cliente padrão com Anon Key (para operações autenticadas via client/RLS)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cliente administrativo com Service Role Key (para rotas de API seguras e webhooks do n8n)
 * Bypassa RLS quando necessário para sincronizações em lote e crons do n8n
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

