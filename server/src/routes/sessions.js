const express = require('express');
const { generatePin } = require('../utils/pinGenerator');
const { readQuestions, readSessionIndex, readSession, writeSession } = require('../data/store');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { className } = req.body;
    const pin = await generatePin();
    const now = new Date().toISOString();

    const questions = await readQuestions();

    const session = {
      sessionId: pin,
      createdAt: now,
      className: className || '',
      questions, // snapshot
      students: []
    };

    await writeSession(pin, session);
    res.status(201).json({ sessionId: pin, className: className || '', questionCount: questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json(await readSessionIndex());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:pin', async (req, res) => {
  try {
    const session = await readSession(req.params.pin.toUpperCase());
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
