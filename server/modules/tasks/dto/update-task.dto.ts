import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { TASK_PRIORITIES } from '@shared/api.interface';
import type { TaskPriority, UpdateTaskRequest } from '@shared/api.interface';

export class UpdateTaskDto implements UpdateTaskRequest {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => String)
  @IsString()
  @IsIn(TASK_PRIORITIES)
  priority?: TaskPriority;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
