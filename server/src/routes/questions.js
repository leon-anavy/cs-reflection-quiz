const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readQuestions, writeQuestions } = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(readQuestions());
});

router.post('/', (req, res) => {
  const body = req.body;
  const questions = readQuestions();

  // Accept single question or array
  const incoming = Array.isArray(body) ? body : [body];
  const added = incoming.map(q => ({
    id: q.id || uuidv4(),
    title: q.title || '',
    codeSnippet: q.codeSnippet || '',
    questionText: q.questionText || '',
    options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
    correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0
  }));

  const updated = [...questions, ...added];
  writeQuestions(updated);
  res.status(201).json(added);
});

router.put('/:id', (req, res) => {
  const questions = readQuestions();
  const idx = questions.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Question not found' });

  questions[idx] = { ...questions[idx], ...req.body, id: req.params.id };
  writeQuestions(questions);
  res.json(questions[idx]);
});

router.delete('/:id', (req, res) => {
  const questions = readQuestions();
  const idx = questions.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Question not found' });

  questions.splice(idx, 1);
  writeQuestions(questions);
  res.status(204).end();
});

module.exports = router;
