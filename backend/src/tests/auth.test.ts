import request from 'supertest';
import { app } from '../app.js';

describe('Auth & System Endpoints', () => {
  it('GET /api/health-check should return 200 and OK status', async () => {
    const res = await request(app).get('/api/health-check');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('POST /api/auth/login with missing fields should return 400 Bad Request', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register with invalid email should return 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Nguyen Van Test',
      email: 'not-an-email',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/pets without authorization token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/pets');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('đăng nhập');
  });

  it('GET /api/admin/stats without admin token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
