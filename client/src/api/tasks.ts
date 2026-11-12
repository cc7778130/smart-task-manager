import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  CreateTaskRequest,
  Task,
  TaskPriority,
  UpdateTaskRequest,
} from '@shared/api.interface';

interface TaskListResponse {
  items: Task[];
}

export const getTasks = (
  priority?: TaskPriority | 'all',
): Promise<TaskListResponse> => {
  return axiosForBackend
    .get('/api/tasks', { params: { priority } })
    .then((r) => r.data);
};

export const createTask = (body: CreateTaskRequest): Promise<Task> => {
  return axiosForBackend.post('/api/tasks', body).then((r) => r.data);
};

export const updateTask = (
  id: string,
  body: UpdateTaskRequest,
): Promise<Task> => {
  return axiosForBackend.patch(`/api/tasks/${id}`, body).then((r) => r.data);
};

export const deleteTask = (id: string): Promise<void> => {
  return axiosForBackend.delete(`/api/tasks/${id}`).then((r) => r.data);
};
