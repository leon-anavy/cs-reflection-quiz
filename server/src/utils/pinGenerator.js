const { getDb } = require('../data/db');

// Exclude ambiguous characters: 0, O, I, 1
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

async function generatePin() {
  const db = await getDb();
  let pin;
  let attempts = 0;
  do {
    pin = Array.from({ length: 5 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('');
    attempts++;
    if (attempts > 100) throw new Error('Could not generate unique PIN');
    const existing = await db.collection('sessions').findOne({ sessionId: pin });
    if (!existing) break;
  } while (true);
  return pin;
}

module.exports = { generatePin };
