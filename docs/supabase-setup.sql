-- =============================================
--  智能任务管理系统 - Supabase 建表 SQL
--  在 Supabase SQL Editor 中直接执行
-- =============================================

-- 0. 清理旧表（如存在）
DROP TABLE IF EXISTS public.tasks CASCADE;

-- 1. 创建任务表
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_completed ON public.tasks(completed);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);

-- 3. 启用行级安全 (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. 创建匿名角色访问策略
-- 说明：应用使用 publishable key（anon 角色）访问，
-- 以下策略允许匿名用户对 tasks 表进行增删改查。

CREATE POLICY "Allow anon select"
  ON public.tasks
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert"
  ON public.tasks
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update"
  ON public.tasks
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow anon delete"
  ON public.tasks
  FOR DELETE
  TO anon
  USING (true);

-- 5. 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_tasks_updated
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
