import { useMemo, useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskPriority,
} from '@shared/api.interface';
import { Badge } from '@client/src/components/ui/badge';
import { Button } from '@client/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@client/src/hooks/useTasks';

const PRIORITY_BADGE_VARIANTS: Record<
  TaskPriority,
  'destructive' | 'default' | 'secondary'
> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

const TasksPage: React.FC = () => {
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>(
    'all',
  );
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');

  const {
    data: tasks,
    isLoading,
    isError,
  } = useTasks(filterPriority);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort(
      (a: Task, b: Task) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tasks]);

  const handleAddTask = (): void => {
    const title = newTitle.trim();
    if (!title) return;
    createMutation.mutate(
      { title, priority: newPriority },
      {
        onSuccess: () => {
          setNewTitle('');
          setNewPriority('medium');
        },
      },
    );
  };

  const handleToggleComplete = (task: Task): void => {
    updateMutation.mutate({
      id: task.id,
      body: { completed: !task.completed },
    });
  };

  const handleDelete = (id: string): void => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              智能任务管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 添加任务区域 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  任务标题
                </label>
                <Input
                  placeholder="请输入任务标题"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask();
                  }}
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="w-full sm:w-32 space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  优先级
                </label>
                <Select
                  value={newPriority}
                  onValueChange={(val) =>
                    setNewPriority(val as TaskPriority)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {TASK_PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddTask}
                disabled={
                  !newTitle.trim() || createMutation.isPending
                }
                className="sm:h-9"
              >
                <Plus className="h-4 w-4" />
                添加任务
              </Button>
            </div>

            {/* 筛选区域 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                优先级筛选：
              </span>
              <Select
                value={filterPriority}
                onValueChange={(val) =>
                  setFilterPriority(val as TaskPriority | 'all')
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="筛选优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 任务列表 */}
            <div className="space-y-2">
              {isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  加载中...
                </div>
              )}
              {isError && (
                <div className="text-center py-8 text-destructive">
                  加载失败，请稍后重试
                </div>
              )}
              {!isLoading && !isError && sortedTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无任务
                </div>
              )}
              {!isLoading &&
                !isError &&
                sortedTasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      task.completed
                        ? 'border-muted bg-muted/30 opacity-60'
                        : 'border-border bg-card'
                    }`}
                  >
                    <Badge
                      variant={PRIORITY_BADGE_VARIANTS[task.priority]}
                      className="shrink-0"
                    >
                      {TASK_PRIORITY_LABELS[task.priority]}
                    </Badge>
                    <span
                      className={`flex-1 truncate text-sm ${
                        task.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="icon"
                        variant={
                          task.completed ? 'secondary' : 'outline'
                        }
                        onClick={() => handleToggleComplete(task)}
                        disabled={updateMutation.isPending}
                        aria-label={
                          task.completed ? '标记为未完成' : '标记为完成'
                        }
                      >
                        {task.completed ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                        disabled={deleteMutation.isPending}
                        aria-label="删除任务"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksPage;
