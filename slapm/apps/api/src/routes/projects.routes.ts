import { Router, Request, Response, RequestHandler } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as projectService from '../services/project.service';

const router = Router();
router.use(requireAuth as RequestHandler);

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const project = await projectService.createProject(authReq.user!.userId, req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const projects = await projectService.getUserProjects(authReq.user!.userId);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const project = await projectService.getProjectById(req.params.id, authReq.user!.userId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await projectService.archiveProject(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive project' });
  }
});

router.post('/:id/members', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body as { userId: string; role: any };
    const member = await projectService.addProjectMember(req.params.id, userId, role);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

export default router;
