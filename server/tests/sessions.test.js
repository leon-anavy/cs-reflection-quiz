const request = require('supertest');
const { app } = require('../src/index');

describe('Sessions API', () => {
  let createdPin;

  // Create a session once before all tests in this suite
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ className: 'כיתה י׳' });
    createdPin = res.body.sessionId;
  });

  test('POST /api/sessions creates session with valid 5-char PIN', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ className: 'Test Class' });

    expect(res.status).toBe(201);
    expect(res.body.sessionId).toMatch(/^[A-Z2-9]{5}$/);
    expect(typeof res.body.questionCount).toBe('number');
  });

  test('GET /api/sessions/:pin returns the full session', async () => {
    const res = await request(app).get(`/api/sessions/${createdPin}`);
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBe(createdPin);
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions.length).toBeGreaterThan(0);
    expect(res.body.students).toEqual([]);
  });

  test('GET /api/sessions/:pin returns 404 for unknown PIN', async () => {
    const res = await request(app).get('/api/sessions/ZZZZZ');
    expect(res.status).toBe(404);
  });

  test('GET /api/sessions lists sessions including the created one', async () => {
    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(s => s.sessionId === createdPin)).toBe(true);
  });

  test('Snapshot isolation: editing question bank does not affect existing session', async () => {
    // Get original session questions (frozen snapshot)
    const sessionBefore = await request(app).get(`/api/sessions/${createdPin}`);
    expect(sessionBefore.body.questions.length).toBeGreaterThan(0);
    const originalTitle = sessionBefore.body.questions[0].title;

    // Add a new question to the global bank
    await request(app)
      .post('/api/questions')
      .send({
        title: 'Brand New Question',
        questionText: 'Q?',
        options: ['a', 'b', 'c', 'd'],
        correctAnswerIndex: 0
      });

    // Session snapshot should be unchanged — same questions, same titles
    const sessionAfter = await request(app).get(`/api/sessions/${createdPin}`);
    expect(sessionAfter.body.questions[0].title).toBe(originalTitle);
    expect(sessionAfter.body.questions.length).toBe(sessionBefore.body.questions.length);
  });
});
