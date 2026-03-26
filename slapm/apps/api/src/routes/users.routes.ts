import { Router, Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

const router = Router();
router.use(requireAuth as RequestHandler);

// Admin-only guard
function requireAdmin(req: Request, res: Response, next: () => void) {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin only' });
    return;
  }
  next();
}
router.use(requireAdmin as RequestHandler);

// GET /api/users — list all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users — create user (admin sets initial password)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, name, role = 'MEMBER', password } = req.body as {
      email?: string; name?: string; role?: string; password?: string;
    };
    if (!email || !name || !password) {
      res.status(400).json({ error: 'email, name and password are required' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'A user with that email already exists' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, role: role as any, passwordHash },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/users/:id — update role
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { role } = req.body as { role?: string };
    if (!role) { res.status(400).json({ error: 'role is required' }); return; }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: role as any },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id — remove user
router.delete('/:id', async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (req.params.id === authReq.user?.userId) {
    res.status(400).json({ error: 'Cannot delete yourself' });
    return;
  }
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
