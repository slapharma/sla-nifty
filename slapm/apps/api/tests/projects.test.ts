import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { generateToken } from '../src/services/auth.service';

const app = createApp();

// These tests require a running PostgreSQL instance.
// Run with: docker compose up -d && npm test
// In CI/sandbox environments, these will fail at DB connection — that is expected.

describe('Projects API', () => {
  let token: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { email: 'proj-test@slapm.test', name: 'Test User', role: 'ADMIN' },
    });
    userId = user.id;
    token = generateToken({ userId: user.id, email: user.email, role: user.role });
  });

  afterAll(async () => {
    await prisma.project.deleteMany({ where: { name: { startsWith: 'Test Project' } } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('POST /api/projects - creates a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project Alpha', description: 'Integration test' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Project Alpha');
    projectId = res.body.id;
  });

  it('GET /api/projects - lists projects for authenticated user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/projects/:id - returns project by id', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(projectId);
  });

  it('GET /api/projects/:id - returns 404 for non-member', async () => {
    const res = await request(app)
      .get('/api/projects/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /api/projects/:id - updates project name', async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project Alpha Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Project Alpha Updated');
  });

  it('DELETE /api/projects/:id - archives project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/projects - returns 401 without token', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
  });
});
