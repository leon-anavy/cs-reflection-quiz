const { getDb } = require('./db');

async function readQuestions() {
  const db = await getDb();
  return db.collection('questions').find({}, { projection: { _id: 0 } }).toArray();
}

async function writeQuestions(questions) {
  const db = await getDb();
  await db.collection('questions').deleteMany({});
  if (questions.length > 0) {
    await db.collection('questions').insertMany(questions.map(q => ({ ...q })));
  }
}

async function readSessionIndex() {
  const db = await getDb();
  const sessions = await db.collection('sessions')
    .find({}, { projection: { _id: 0, sessionId: 1, createdAt: 1, className: 1, students: 1 } })
    .sort({ createdAt: -1 })
    .toArray();
  return sessions.map(s => ({
    sessionId: s.sessionId,
    createdAt: s.createdAt,
    className: s.className,
    studentCount: s.students ? s.students.length : 0
  }));
}

async function readSession(pin) {
  const db = await getDb();
  const session = await db.collection('sessions').findOne(
    { sessionId: pin },
    { projection: { _id: 0 } }
  );
  return session || null;
}

async function writeSession(pin, session) {
  const db = await getDb();
  await db.collection('sessions').replaceOne(
    { sessionId: pin },
    session,
    { upsert: true }
  );
}

module.exports = {
  readQuestions,
  writeQuestions,
  readSessionIndex,
  readSession,
  writeSession
};
