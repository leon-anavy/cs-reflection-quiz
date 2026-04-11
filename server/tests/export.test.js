const request = require('supertest');
const { app } = require('../src/index');

describe('Export API', () => {
  let pin;

  beforeAll(async () => {
    const res = await request(app).post('/api/sessions').send({ className: 'Export Test' });
    pin = res.body.sessionId;
  });

  test('GET /api/export/:pin/json returns valid JSON attachment', async () => {
    const res = await request(app).get(`/api/export/${pin}/json`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.body.sessionId).toBe(pin);
    expect(Array.isArray(res.body.questions)).toBe(true);
  });

  test('GET /api/export/:pin/csv returns CSV attachment with headers', async () => {
    const res = await request(app).get(`/api/export/${pin}/csv`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-type']).toContain('text/csv');

    // Should at minimum have the header row
    const text = res.text.replace(/^\uFEFF/, ''); // strip BOM
    const firstLine = text.split('\n')[0];
    expect(firstLine).toContain('studentName');
    expect(firstLine).toContain('questionId');
    expect(firstLine).toContain('isCorrect');
  });

  test('GET /api/export/:pin/json returns 404 for unknown PIN', async () => {
    const res = await request(app).get('/api/export/ZZZZZ/json');
    expect(res.status).toBe(404);
  });

  test('GET /api/export/:pin/csv returns 404 for unknown PIN', async () => {
    const res = await request(app).get('/api/export/ZZZZZ/csv');
    expect(res.status).toBe(404);
  });
});
