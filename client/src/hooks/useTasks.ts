import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import type {
  CreateTaskRequest,
  Task,
  TaskPriority,
  UpdateTaskRequest,
} from '@shared/api.interface';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '@client/src/api/tasks';

export const useTasks = (
  priority: TaskPriority | 'all',
): UseQueryResult<Task[]> => {
  return useQuery<Task[]>({
    queryKey: ['tasks', priority],
    queryFn: () => getTasks(priority).then((res) => res.items),
  });
};

export const useCreateTask = (): UseMutationResult<
  Task,
  Error,
  CreateTaskRequest
> => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskRequest>({
    mutationFn: createTask,
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = (): UseMutationResult<
  Task,
  Error,
  { id: string; body: UpdateTaskRequest }
> => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, { id: string; body: UpdateTaskRequest }>({
    mutationFn: ({ id, body }) => updateTask(id, body),
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTask,
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
