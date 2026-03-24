import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Health Check', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route-xyz');
    expect(res.status).toBe(404);
  });
});
