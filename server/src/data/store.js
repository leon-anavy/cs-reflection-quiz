const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname);

function resolveDataPath(relativePath) {
  return path.join(DATA_DIR, relativePath);
}

function readJSON(filePath) {
  const resolved = resolveDataPath(filePath);
  if (!fs.existsSync(resolved)) return null;
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function writeJSON(filePath, data) {
  const resolved = resolveDataPath(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(data, null, 2), 'utf8');
}

function readQuestions() {
  return readJSON('questions.json') || [];
}

function writeQuestions(questions) {
  writeJSON('questions.json', questions);
}

function readSessionIndex() {
  return readJSON('sessions/_index.json') || [];
}

function writeSessionIndex(index) {
  writeJSON('sessions/_index.json', index);
}

function readSession(pin) {
  return readJSON(`sessions/${pin}.json`);
}

function writeSession(pin, session) {
  writeJSON(`sessions/${pin}.json`, session);
}

module.exports = {
  readQuestions,
  writeQuestions,
  readSessionIndex,
  writeSessionIndex,
  readSession,
  writeSession
};
