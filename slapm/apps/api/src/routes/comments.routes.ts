import { Router, Request, Response, RequestHandler } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

const router = Router();
router.use(requireAuth as RequestHandler);

router.get('/', async (req: Request, res: Response) => {
  const { taskId } = req.query as { taskId: string };
  const comments = await prisma.comment.findMany({
    where: { taskId, parentId: null },
    include: { author: true, replies: { include: { author: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(comments);
});

router.post('/', async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { taskId, body, parentId } = req.body;
  const comment = await prisma.comment.create({
    data: { taskId, body, parentId, authorId: authReq.user!.userId },
    include: { author: true },
  });
  const io = (req.app as any).get('io');
  if (io) io.to(`task:${taskId}`).emit('comment:new', comment);
  res.status(201).json(comment);
});

export default router;
