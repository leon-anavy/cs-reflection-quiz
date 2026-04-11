const fs = require('fs');
const path = require('path');

// Exclude ambiguous characters: 0, O, I, 1
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generatePin() {
  const sessionsDir = process.env.DATA_DIR
    ? path.join(process.env.DATA_DIR, 'sessions')
    : path.join(__dirname, '..', 'data', 'sessions');

  let pin;
  let attempts = 0;
  do {
    pin = Array.from({ length: 5 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('');
    attempts++;
    if (attempts > 100) throw new Error('Could not generate unique PIN');
  } while (fs.existsSync(path.join(sessionsDir, `${pin}.json`)));

  return pin;
}

module.exports = { generatePin };
