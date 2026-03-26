import { Router, Request, Response, RequestHandler } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as taskService from '../services/task.service';

const router = Router();
router.use(requireAuth as RequestHandler);

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const task = await taskService.createTask(authReq.user!.userId, req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const { projectId, status } = req.query as { projectId?: string; status?: string };
  if (!projectId) {
    res.status(400).json({ error: 'projectId query parameter is required' });
    return;
  }
  try {
    const tasks = await taskService.getProjectTasks(projectId, status);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: string };
    const task = await taskService.updateTaskStatus(req.params.id, status as any);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

router.patch('/:id/position', async (req: Request, res: Response) => {
  try {
    const { position, status } = req.body as { position: number; status: string };
    const task = await taskService.updateTaskPosition(req.params.id, position, status as any);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task position' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
