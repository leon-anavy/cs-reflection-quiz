const { MongoClient } = require('mongodb');

let client;
let db;

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cs-reflection-quiz';
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  await db.collection('sessions').createIndex({ sessionId: 1 }, { unique: true });
  console.log('Connected to MongoDB');
  return db;
}

async function getDb() {
  if (!db) await connect();
  return db;
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connect, getDb, close };
