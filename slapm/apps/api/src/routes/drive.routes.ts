import { Router, Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as driveService from '../services/drive.service';
import { prisma } from '../config/prisma';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(requireAuth as RequestHandler);

router.post('/projects/:projectId/connect', async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const folderId = await driveService.createProjectFolder(accessToken, project.name);
  await prisma.project.update({ where: { id: req.params.projectId }, data: { driveFolder: folderId } });
  res.json({ folderId });
});

router.post('/tasks/:taskId/upload', upload.single('file'), async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  const task = await prisma.task.findUnique({
    where: { id: req.params.taskId },
    include: { project: true },
  });
  if (!task?.project.driveFolder) return res.status(400).json({ error: 'Project not connected to Drive' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileInfo = await driveService.uploadFile(
    accessToken,
    task.project.driveFolder,
    req.file.originalname,
    req.file.mimetype,
    req.file.buffer
  );

  const existing = (task.driveFiles as { fileId: string; name: string; webViewLink: string }[]) ?? [];
  await prisma.task.update({
    where: { id: req.params.taskId },
    data: { driveFiles: [...existing, fileInfo] },
  });

  res.json(fileInfo);
});

export default router;
