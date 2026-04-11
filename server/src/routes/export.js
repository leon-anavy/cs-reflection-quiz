const express = require('express');
const { readSession } = require('../data/store');
const { sessionToCSV } = require('../utils/csvExport');

const router = express.Router();

router.get('/:pin/csv', (req, res) => {
  const session = readSession(req.params.pin.toUpperCase());
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const csv = sessionToCSV(session);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="session-${session.sessionId}.csv"`);
  res.send('\uFEFF' + csv); // BOM for Hebrew Excel compatibility
});

router.get('/:pin/json', (req, res) => {
  const session = readSession(req.params.pin.toUpperCase());
  if (!session) return res.status(404).json({ error: 'Session not found' });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="session-${session.sessionId}.json"`);
  res.json(session);
});

module.exports = router;
