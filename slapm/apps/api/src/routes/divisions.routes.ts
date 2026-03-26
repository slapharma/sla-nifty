import { Router, Request, Response, RequestHandler } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

const router = Router();
router.use(requireAuth as RequestHandler);

// GET /api/divisions — all divisions with project counts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const divisions = await prisma.division.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(divisions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch divisions' });
  }
});

// GET /api/divisions/:id/projects
router.get('/:id/projects', async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { divisionId: req.params.id, archived: false },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Admin-only below
function requireAdmin(req: Request, res: Response, next: () => void) {
  if ((req as AuthRequest).user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin only' }); return;
  }
  next();
}

router.post('/', requireAdmin as RequestHandler, async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body as { name?: string; description?: string; color?: string };
    if (!name) { res.status(400).json({ error: 'name is required' }); return; }
    const division = await prisma.division.create({ data: { name, description, color: color ?? '#6366F1' } });
    res.status(201).json(division);
  } catch {
    res.status(500).json({ error: 'Failed to create division' });
  }
});

router.patch('/:id', requireAdmin as RequestHandler, async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body as { name?: string; description?: string; color?: string };
    const division = await prisma.division.update({ where: { id: req.params.id }, data: { name, description, color } });
    res.json(division);
  } catch {
    res.status(500).json({ error: 'Failed to update division' });
  }
});

router.delete('/:id', requireAdmin as RequestHandler, async (req: Request, res: Response) => {
  try {
    await prisma.division.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete division' });
  }
});

export default router;
