import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../config/prisma';
import * as exportService from '../services/export.service';

const router = Router();
router.use(requireAuth);

router.get('/projects/:projectId/tasks.csv', async (req: Request, res: Response) => {
  const csv = await exportService.exportTasksCSV(req.params.projectId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="tasks-${req.params.projectId}.csv"`);
  res.send(csv);
});

router.get('/projects/:projectId/tasks.pdf', async (req: Request, res: Response) => {
  const [project, tasks] = await Promise.all([
    prisma.project.findUnique({ where: { id: req.params.projectId } }),
    prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: { assignee: true },
      orderBy: { status: 'asc' },
    }),
  ]);
  const pdf = exportService.generateTasksPDF(project?.name ?? 'Project', tasks);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="tasks-${req.params.projectId}.pdf"`);
  res.send(pdf);
});

export default router;
