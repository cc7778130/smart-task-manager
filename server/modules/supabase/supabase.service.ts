import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private clientInstance: SupabaseClient | null = null;

  getClient(): SupabaseClient {
    if (!this.clientInstance) {
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY || '';

      if (!supabaseUrl) {
        throw new Error(
          'SUPABASE_URL 未配置，请在环境变量中设置 SUPABASE_URL',
        );
      }
      if (!supabaseKey) {
        throw new Error(
          'SUPABASE_SERVICE_ROLE_KEY 或 SUPABASE_PUBLISHABLE_KEY 未配置，请在环境变量中设置',
        );
      }

      this.clientInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
    }
    return this.clientInstance;
  }
}
