const { close } = require('../src/data/db');

module.exports = async function () {
  await close();
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
};
