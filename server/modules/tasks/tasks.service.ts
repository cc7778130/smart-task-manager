import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  CreateTaskRequest,
  Task,
  TaskListRequest,
  TaskListResponse,
  UpdateTaskRequest,
} from '@shared/api.interface';
import { isTaskPriority } from '@shared/api.interface';
import { SupabaseService } from '../supabase/supabase.service';

interface SupabaseTaskRow {
  id: string;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  private mapRow(row: SupabaseTaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      priority: isTaskPriority(row.priority) ? row.priority : 'medium',
      completed: row.completed,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  private handleError(error: PostgrestError, operation: string): never {
    this.logger.error(`Supabase ${operation} failed: ${error.message}`, error.code);
    switch (error.code) {
      case 'PGRST116':
        throw new NotFoundException('任务不存在');
      case '42501':
        throw new ForbiddenException(
          '数据库访问被拒绝，请检查 Supabase RLS 策略或使用 service_role key',
        );
      case '42P01':
        throw new InternalServerErrorException(
          'tasks 表不存在，请先在 Supabase 中执行建表 SQL',
        );
      default:
        throw new BadRequestException(error.message || '操作失败');
    }
  }

  async findAll(query: TaskListRequest): Promise<TaskListResponse> {
    let req = this.db
      .from('tasks')
      .select('id, title, priority, completed, created_at')
      .order('created_at', { ascending: false });

    if (query.priority && query.priority !== 'all') {
      req = req.eq('priority', query.priority);
    }

    const { data, error } = await req;
    if (error) this.handleError(error, 'findAll');

    const items: Task[] = (data as SupabaseTaskRow[]).map((row) => this.mapRow(row));
    return { items };
  }

  async create(dto: CreateTaskRequest): Promise<Task> {
    const { data, error } = await this.db
      .from('tasks')
      .insert({
        title: dto.title,
        priority: dto.priority,
      })
      .select('id, title, priority, completed, created_at')
      .single();

    if (error) this.handleError(error, 'create');
    return this.mapRow(data as SupabaseTaskRow);
  }

  async update(id: string, dto: UpdateTaskRequest): Promise<Task> {
    const patch: Record<string, unknown> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.priority !== undefined) patch.priority = dto.priority;
    if (dto.completed !== undefined) patch.completed = dto.completed;

    const { data, error } = await this.db
      .from('tasks')
      .update(patch)
      .eq('id', id)
      .select('id, title, priority, completed, created_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.details?.includes('0 rows')) {
        throw new NotFoundException('任务不存在');
      }
      this.handleError(error, 'update');
    }

    return this.mapRow(data as SupabaseTaskRow);
  }

  async remove(id: string): Promise<{ success: true }> {
    const { error, count } = await this.db
      .from('tasks')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) this.handleError(error, 'remove');
    if (count === 0) throw new NotFoundException('任务不存在');

    return { success: true };
  }
}
