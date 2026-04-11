const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readQuestions, writeQuestions } = require('../data/store');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await readQuestions());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const questions = await readQuestions();

    const incoming = Array.isArray(body) ? body : [body];
    const added = incoming.map(q => ({
      id: q.id || uuidv4(),
      title: q.title || '',
      codeSnippet: q.codeSnippet || '',
      questionText: q.questionText || '',
      options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
      correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
      answerExplanations: Array.isArray(q.answerExplanations) ? q.answerExplanations : ['', '', '', '']
    }));

    await writeQuestions([...questions, ...added]);
    res.status(201).json(added);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const questions = await readQuestions();
    const idx = questions.findIndex(q => q.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Question not found' });

    questions[idx] = { ...questions[idx], ...req.body, id: req.params.id };
    await writeQuestions(questions);
    res.json(questions[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await writeQuestions([]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const questions = await readQuestions();
    const idx = questions.findIndex(q => q.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Question not found' });

    questions.splice(idx, 1);
    await writeQuestions(questions);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
