import { Type } from 'class-transformer';
import { IsIn, IsString, IsNotEmpty } from 'class-validator';
import { TASK_PRIORITIES } from '@shared/api.interface';
import type { CreateTaskRequest, TaskPriority } from '@shared/api.interface';

export class CreateTaskDto implements CreateTaskRequest {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Type(() => String)
  @IsString()
  @IsIn(TASK_PRIORITIES)
  priority!: TaskPriority;
}
