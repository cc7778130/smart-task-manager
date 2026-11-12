import {
  fail,
  getDb,
  isPriority,
  mapRow,
  readBody,
  type TaskRow,
} from './_lib';

const SELECT_FIELDS = 'id, title, priority, completed, created_at';

export default async function handler(req: any, res: any): Promise<void> {
  try {
    const db = getDb();

    if (req.method === 'GET') {
      const priority = String(req.query?.priority ?? 'all');

      let query = db
        .from('tasks')
        .select(SELECT_FIELDS)
        .order('created_at', { ascending: false });

      if (priority !== 'all') {
        if (!isPriority(priority)) {
          fail(res, 400, '无效的优先级');
          return;
        }
        query = query.eq('priority', priority);
      }

      const { data, error } = await query;
      if (error) {
        fail(res, 500, error.message || '查询任务失败');
        return;
      }

      res.status(200).json({
        items: ((data ?? []) as TaskRow[]).map(mapRow),
      });
      return;
    }

    if (req.method === 'POST') {
      const body = readBody(req);
      const title = String(body.title ?? '').trim();
      const priority = body.priority;

      if (!title) {
        fail(res, 400, '任务标题不能为空');
        return;
      }
      if (title.length > 255) {
        fail(res, 400, '任务标题不能超过 255 个字符');
        return;
      }
      if (!isPriority(priority)) {
        fail(res, 400, '优先级只能是 high、medium 或 low');
        return;
      }

      const { data, error } = await db
        .from('tasks')
        .insert({ title, priority })
        .select(SELECT_FIELDS)
        .single();

      if (error) {
        fail(res, 500, error.message || '创建任务失败');
        return;
      }

      res.status(201).json(mapRow(data as TaskRow));
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    fail(res, 405, '不支持的请求方法');
  } catch (error: any) {
    fail(res, 500, error?.message || '服务器内部错误');
  }
}
