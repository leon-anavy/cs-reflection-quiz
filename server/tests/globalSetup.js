const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function () {
  const mongod = new MongoMemoryServer();
  await mongod.start();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.__MONGOD_INSTANCE__ = JSON.stringify({ uri, storageEngine: mongod._instanceInfo?.storageEngine });
  global.__MONGOD__ = mongod;
};
