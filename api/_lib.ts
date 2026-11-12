import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const TASK_PRIORITIES = ['high', 'medium', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskRow {
  id: string;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

export interface TaskDto {
  id: string;
  title: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
}

let clientInstance: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (!clientInstance) {
    const url = process.env.SUPABASE_URL || '';
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      '';

    if (!url) {
      throw new Error('SUPABASE_URL 未配置，请在 Vercel 环境变量中设置');
    }
    if (!key) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY 或 SUPABASE_PUBLISHABLE_KEY 未配置，请在 Vercel 环境变量中设置',
      );
    }

    clientInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return clientInstance;
}

export function isPriority(value: unknown): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(String(value));
}

export function mapRow(row: TaskRow): TaskDto {
  return {
    id: row.id,
    title: row.title,
    priority: isPriority(row.priority) ? row.priority : 'medium',
    completed: row.completed,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export function readBody(req: { body?: unknown }): Record<string, unknown> {
  const body = req.body;
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return body as Record<string, unknown>;
}

export function fail(res: { status: (code: number) => { json: (data: unknown) => void } }, status: number, message: string): void {
  res.status(status).json({ message });
}
