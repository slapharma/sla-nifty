import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { generateToken } from '../src/services/auth.service';

const app = createApp();

// Requires running PostgreSQL. Will fail at DB connection in sandbox.
describe('Tasks API', () => {
  let token: string;
  let userId: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { email: 'task-test@slapm.test', name: 'Task Tester', role: 'ADMIN' },
    });
    userId = user.id;
    token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const project = await prisma.project.create({
      data: {
        name: 'Task Test Project',
        members: { create: { userId, role: 'ADMIN' } },
      },
    });
    projectId = project.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('POST /api/tasks - creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write test plan', projectId, priority: 'HIGH' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write test plan');
    expect(res.body.status).toBe('TODO');
    taskId = res.body.id;
  });

  it('GET /api/tasks?projectId=... - lists tasks for project', async () => {
    const res = await request(app)
      .get(`/api/tasks?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/tasks - returns 400 without projectId', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('PATCH /api/tasks/:id - updates task title', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated test plan' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated test plan');
  });

  it('PATCH /api/tasks/:id/status - updates task status', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('PATCH /api/tasks/:id/position - reorders task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/position`)
      .set('Authorization', `Bearer ${token}`)
      .send({ position: 500, status: 'IN_REVIEW' });
    expect(res.status).toBe(200);
    expect(res.body.position).toBe(500);
  });

  it('DELETE /api/tasks/:id - deletes task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
