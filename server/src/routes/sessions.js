const express = require('express');
const { generatePin } = require('../utils/pinGenerator');
const {
  readQuestions,
  readSessionIndex,
  writeSessionIndex,
  readSession,
  writeSession
} = require('../data/store');

const router = express.Router();

// Create new session (snapshot question bank)
router.post('/', (req, res) => {
  const { className } = req.body;
  const pin = generatePin();
  const now = new Date().toISOString();

  // Snapshot the current question bank
  const questions = readQuestions();

  const session = {
    sessionId: pin,
    createdAt: now,
    className: className || '',
    questions, // snapshot — immutable from here on
    students: []
  };

  writeSession(pin, session);

  const index = readSessionIndex();
  index.push({ sessionId: pin, createdAt: now, className: className || '' });
  writeSessionIndex(index);

  res.status(201).json({ sessionId: pin, className: className || '', questionCount: questions.length });
});

// List all sessions (lightweight)
router.get('/', (req, res) => {
  const index = readSessionIndex();
  // Enrich with student count
  const enriched = index.map(entry => {
    const session = readSession(entry.sessionId);
    return {
      ...entry,
      studentCount: session ? session.students.length : 0
    };
  });
  res.json(enriched.reverse()); // newest first
});

// Get full session
router.get('/:pin', (req, res) => {
  const session = readSession(req.params.pin.toUpperCase());
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

module.exports = router;
