const request = require('supertest');
const { app } = require('../src/index');
const { getDb } = require('../src/data/db');

describe('Questions API', () => {
  // Reset the question bank to the default before this suite runs
  beforeAll(async () => {
    const defaultQuestions = require('../src/data/questions.json');
    const { writeQuestions } = require('../src/data/store');
    await writeQuestions(defaultQuestions);
  });

  test('GET /api/questions returns array of 7 default questions', async () => {
    const res = await request(app).get('/api/questions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(7);
  });

  test('POST /api/questions adds a single question', async () => {
    const before = await request(app).get('/api/questions');
    const count = before.body.length;

    const newQ = {
      title: 'Test Question',
      codeSnippet: '',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswerIndex: 1
    };

    const res = await request(app)
      .post('/api/questions')
      .send(newQ);

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('Test Question');
    expect(res.body[0].id).toBeTruthy();

    const after = await request(app).get('/api/questions');
    expect(after.body.length).toBe(count + 1);
  });

  test('POST /api/questions imports array of questions', async () => {
    const before = await request(app).get('/api/questions');
    const count = before.body.length;

    const questions = [
      { title: 'Q A', questionText: 'Q?', options: ['a', 'b', 'c', 'd'], correctAnswerIndex: 0 },
      { title: 'Q B', questionText: 'Q?', options: ['a', 'b', 'c', 'd'], correctAnswerIndex: 1 }
    ];

    const res = await request(app)
      .post('/api/questions')
      .send(questions);

    expect(res.status).toBe(201);
    expect(res.body.length).toBe(2);

    const after = await request(app).get('/api/questions');
    expect(after.body.length).toBe(count + 2);
  });

  test('PUT /api/questions/:id updates only the target question', async () => {
    const list = await request(app).get('/api/questions');
    const target = list.body[0];

    const res = await request(app)
      .put(`/api/questions/${target.id}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
    expect(res.body.id).toBe(target.id);

    // Other questions unchanged
    const after = await request(app).get('/api/questions');
    const others = after.body.filter(q => q.id !== target.id);
    const original = list.body.filter(q => q.id !== target.id);
    expect(others.map(q => q.title)).toEqual(original.map(q => q.title));
  });

  test('DELETE /api/questions/:id removes the question', async () => {
    const list = await request(app).get('/api/questions');
    const target = list.body[0];

    const res = await request(app).delete(`/api/questions/${target.id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get('/api/questions');
    expect(after.body.find(q => q.id === target.id)).toBeUndefined();
    expect(after.body.length).toBe(list.body.length - 1);
  });

  test('PUT /api/questions/:id returns 404 for unknown id', async () => {
    const res = await request(app).put('/api/questions/nonexistent').send({ title: 'X' });
    expect(res.status).toBe(404);
  });
});
