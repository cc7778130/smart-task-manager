import {
  fail,
  getDb,
  isPriority,
  mapRow,
  readBody,
  type TaskRow,
} from '../_lib';

const SELECT_FIELDS = 'id, title, priority, completed, created_at';

export default async function handler(req: any, res: any): Promise<void> {
  try {
    const db = getDb();
    const id = String(req.query?.id ?? '');

    if (!id) {
      fail(res, 400, '缺少任务 ID');
      return;
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = readBody(req);
      const patch: Record<string, unknown> = {};

      if (body.title !== undefined) {
        const title = String(body.title).trim();
        if (!title) {
          fail(res, 400, '任务标题不能为空');
          return;
        }
        patch.title = title.slice(0, 255);
      }
      if (body.priority !== undefined) {
        if (!isPriority(body.priority)) {
          fail(res, 400, '优先级只能是 high、medium 或 low');
          return;
        }
        patch.priority = body.priority;
      }
      if (body.completed !== undefined) {
        patch.completed = Boolean(body.completed);
      }

      if (Object.keys(patch).length === 0) {
        fail(res, 400, '没有需要更新的字段');
        return;
      }

      const { data, error } = await db
        .from('tasks')
        .update(patch)
        .eq('id', id)
        .select(SELECT_FIELDS)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          fail(res, 404, '任务不存在');
          return;
        }
        fail(res, 500, error.message || '更新任务失败');
        return;
      }

      res.status(200).json(mapRow(data as TaskRow));
      return;
    }

    if (req.method === 'DELETE') {
      const { error, count } = await db
        .from('tasks')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) {
        fail(res, 500, error.message || '删除任务失败');
        return;
      }
      if (count === 0) {
        fail(res, 404, '任务不存在');
        return;
      }

      res.status(200).json({ success: true });
      return;
    }

    res.setHeader('Allow', 'PATCH, DELETE');
    fail(res, 405, '不支持的请求方法');
  } catch (error: any) {
    fail(res, 500, error?.message || '服务器内部错误');
  }
}
