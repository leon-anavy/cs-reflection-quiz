const express = require('express');
const { readSession } = require('../data/store');
const { sessionToCSV } = require('../utils/csvExport');

const router = express.Router();

router.get('/:pin/csv', async (req, res) => {
  try {
    const session = await readSession(req.params.pin.toUpperCase());
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const csv = sessionToCSV(session);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="session-${session.sessionId}.csv"`);
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:pin/json', async (req, res) => {
  try {
    const session = await readSession(req.params.pin.toUpperCase());
    if (!session) return res.status(404).json({ error: 'Session not found' });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="session-${session.sessionId}.json"`);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
