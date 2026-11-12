import axios from 'axios';
import type {
  CreateTaskRequest,
  Task,
  TaskPriority,
  TaskListResponse,
  UpdateTaskRequest,
} from '@shared/api.interface';

const http = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

export const getTasks = (
  priority?: TaskPriority | 'all',
): Promise<TaskListResponse> => {
  return http
    .get('/api/tasks', { params: { priority } })
    .then((r) => r.data as TaskListResponse);
};

export const createTask = (body: CreateTaskRequest): Promise<Task> => {
  return http.post('/api/tasks', body).then((r) => r.data as Task);
};

export const updateTask = (
  id: string,
  body: UpdateTaskRequest,
): Promise<Task> => {
  return http.patch(`/api/tasks/${id}`, body).then((r) => r.data as Task);
};

export const deleteTask = (id: string): Promise<void> => {
  return http.delete(`/api/tasks/${id}`).then((r) => r.data as void);
};
