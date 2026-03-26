import { Router, Request, Response, RequestHandler } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as milestoneService from '../services/milestone.service';

const router = Router();
router.use(requireAuth as RequestHandler);

router.post('/', async (req: Request, res: Response) => {
  const milestone = await milestoneService.createMilestone(req.body);
  res.status(201).json(milestone);
});

router.get('/', async (req: Request, res: Response) => {
  const { projectId } = req.query as { projectId: string };
  const milestones = await milestoneService.getProjectMilestones(projectId);
  res.json(milestones);
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  const milestone = await milestoneService.updateMilestoneStatus(req.params.id, req.body.status);
  res.json(milestone);
});

export default router;
