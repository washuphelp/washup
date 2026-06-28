import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export interface LoginHistoryRecord {
  id?: string;
  created_at?: string;
  username: string;
  status: 'SUCCESS' | 'FAILED';
  ip_address: string;
  device_type: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  user_agent: string;
  resolution: string;
  country: string;
  state: string;
  city: string;
  is_new_device: boolean;
  session_id: string;
  device_id: string;
  is_logged_out?: boolean;
}
