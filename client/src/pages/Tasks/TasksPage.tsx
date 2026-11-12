import { useMemo, useState } from 'react';
import {
  Check,
  ListChecks,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskPriority,
} from '@shared/api.interface';
import { Button } from '@client/src/components/ui/button';
import { Card } from '@client/src/components/ui/card';
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

/* 优先级配色：高红、中橙、低绿 */
const PRIORITY_PILL: Record<TaskPriority, string> = {
  high: 'border-[#f8d7d7] bg-[#fdecec] text-[#c92a2a]',
  medium: 'border-[#f7e3c4] bg-[#fdf3e3] text-[#b45309]',
  low: 'border-[#d3ecdd] bg-[#e9f7ef] text-[#16794a]',
};

const FILTER_ITEMS: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

/* 统一的输入框样式：同高度、同圆角、同边框 */
const FIELD_CLASS =
  'h-11 rounded-[10px] border-[#d8e0ea] bg-white text-sm shadow-none placeholder:text-[#98a2b3] focus-visible:border-[#3b7dd8] focus-visible:ring-[3px] focus-visible:ring-[#3b7dd8]/15';

/* 统一的按钮样式：同高度、同圆角、同主色 */
const PRIMARY_BTN_CLASS =
  'h-11 rounded-[10px] border-[#3b7dd8] bg-[#3b7dd8] px-6 text-sm font-medium text-white hover:bg-[#2f6cc0] hover:border-[#2f6cc0] disabled:border-[#b9cdea] disabled:bg-[#b9cdea]';

const StatItem = ({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'default' | 'done' | 'todo';
}) => {
  const color =
    tone === 'done'
      ? 'text-[#16924a]'
      : tone === 'todo'
        ? 'text-[#d97706]'
        : 'text-[#1f2937]';
  return (
    <div className="rounded-xl border border-[#e5eaf1] bg-[#f7f9fc] px-2 py-3 text-center">
      <span className={`block text-xl font-semibold leading-tight ${color}`}>
        {value}
      </span>
      <span className="mt-0.5 block text-xs text-[#98a2b3]">{label}</span>
    </div>
  );
};

const TasksPage: React.FC = () => {
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>(
    'all',
  );
  const [keyword, setKeyword] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');

  /* 取全量任务，统计和筛选都在前端完成，保证统计数字不受筛选影响 */
  const { data: allTasks, isLoading, isError } = useTasks('all');
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const stats = useMemo(() => {
    const list = allTasks ?? [];
    const done = list.filter((t: Task) => t.completed).length;
    return { total: list.length, done, todo: list.length - done };
  }, [allTasks]);

  const visibleTasks = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return [...(allTasks ?? [])]
      .filter(
        (t: Task) => filterPriority === 'all' || t.priority === filterPriority,
      )
      .filter((t: Task) => !kw || t.title.toLowerCase().includes(kw))
      .sort(
        (a: Task, b: Task) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [allTasks, filterPriority, keyword]);

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
    <div className="min-h-screen bg-[#eef2f7] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[720px]">
        <Card className="rounded-2xl border-[#e5eaf1] bg-white p-6 shadow-[0_1px_2px_rgba(23,43,77,0.04),0_8px_24px_rgba(23,43,77,0.06)] sm:p-8">
          {/* 标题区 */}
          <header className="text-center">
            <div className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#eaf1fc]">
              <ListChecks className="h-6 w-6 text-[#3b7dd8]" />
            </div>
            <h1 className="text-[22px] font-semibold tracking-[0.3px] text-[#1f2937]">
              智能任务管理
            </h1>
            <p className="mt-1.5 text-[13px] text-[#98a2b3]">
              记录你的待办，按优先级安排今天的节奏
            </p>
          </header>

          {/* 任务统计 */}
          <section className="mt-6 grid grid-cols-3 gap-2.5">
            <StatItem value={stats.total} label="总任务" tone="default" />
            <StatItem value={stats.done} label="已完成" tone="done" />
            <StatItem value={stats.todo} label="未完成" tone="todo" />
          </section>

          {/* 搜索 */}
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
            <Input
              placeholder="搜索任务标题"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={`${FIELD_CLASS} pl-10`}
            />
          </div>

          {/* 添加任务 */}
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <Input
              placeholder="输入任务内容，回车即可添加"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
              disabled={createMutation.isPending}
              className={`${FIELD_CLASS} flex-1`}
            />
            <Select
              value={newPriority}
              onValueChange={(val) => setNewPriority(val as TaskPriority)}
            >
              <SelectTrigger
                className={`${FIELD_CLASS} w-full sm:w-[104px]`}
              >
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddTask}
              disabled={!newTitle.trim() || createMutation.isPending}
              className={PRIMARY_BTN_CLASS}
            >
              <Plus className="h-4 w-4" />
              添加任务
            </Button>
          </div>

          {/* 优先级筛选 */}
          <div className="mt-5 flex flex-wrap gap-2 border-b border-[#e5eaf1] pb-4">
            {FILTER_ITEMS.map((item) => {
              const active = filterPriority === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilterPriority(item.value)}
                  className={`h-9 flex-1 rounded-[10px] border px-2 text-[11px] transition-colors sm:h-8 sm:flex-none sm:px-3.5 sm:text-xs ${
                    active
                      ? 'border-[#3b7dd8] bg-[#3b7dd8] text-white'
                      : 'border-[#d8e0ea] bg-white text-[#5b6675] hover:border-[#3b7dd8] hover:bg-[#eaf1fc] hover:text-[#3b7dd8]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* 任务列表 */}
          <div className="mt-4 flex flex-col gap-2.5">
            {isLoading && (
              <div className="rounded-xl border border-dashed border-[#d8e0ea] py-9 text-center text-sm text-[#98a2b3]">
                加载中...
              </div>
            )}
            {isError && (
              <div className="rounded-xl border border-dashed border-[#f8d7d7] py-9 text-center text-sm text-[#c92a2a]">
                加载失败，请稍后重试
              </div>
            )}
            {!isLoading && !isError && visibleTasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#d8e0ea] py-9 text-center text-sm text-[#98a2b3]">
                {stats.total === 0
                  ? '还没有任务，先添加一条试试吧'
                  : '没有找到匹配的任务'}
              </div>
            )}

            {!isLoading &&
              !isError &&
              visibleTasks.map((task: Task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                    task.completed
                      ? 'border-[#eef1f5] bg-[#fcfdfe]'
                      : 'border-[#e5eaf1] bg-white hover:-translate-y-px hover:border-[#c8d8ec] hover:shadow-[0_4px_14px_rgba(23,43,77,0.10)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(task)}
                    disabled={updateMutation.isPending}
                    aria-label={task.completed ? '标记为未完成' : '标记为完成'}
                    className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                      task.completed
                        ? 'border-[#3b7dd8] bg-[#3b7dd8]'
                        : 'border-[#d8e0ea] bg-white hover:border-[#3b7dd8] hover:bg-[#eaf1fc]'
                    }`}
                  >
                    {task.completed && (
                      <Check className="h-3 w-3 text-white" strokeWidth={3.4} />
                    )}
                  </button>

                  <span
                    className={`flex-1 break-words text-sm ${
                      task.completed
                        ? 'text-[#98a2b3] line-through'
                        : 'text-[#1f2937]'
                    }`}
                  >
                    {task.title}
                  </span>

                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_PILL[task.priority]}`}
                  >
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    disabled={deleteMutation.isPending}
                    aria-label="删除任务"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-[#98a2b3] transition-colors hover:border-[#f8d7d7] hover:bg-[#fdecec] hover:text-[#d64545]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>

          <p className="mt-5 border-t border-[#e5eaf1] pt-4 text-center text-xs text-[#98a2b3]">
            任务数据保存在云端，刷新或换设备都不会丢失
          </p>
        </Card>
      </div>
    </div>
  );
};

export default TasksPage;
