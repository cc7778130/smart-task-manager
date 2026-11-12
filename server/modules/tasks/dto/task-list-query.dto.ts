import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { TASK_PRIORITIES } from '@shared/api.interface';
import type { TaskListRequest, TaskPriority } from '@shared/api.interface';

export class TaskListQueryDto implements TaskListRequest {
  @IsOptional()
  @IsString()
  @Transform(({ obj, key, value }) => (obj[key] === '' ? undefined : value))
  @IsIn([...TASK_PRIORITIES, 'all'])
  priority?: TaskPriority | 'all';
}
