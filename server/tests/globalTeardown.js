const fs = require('fs');

module.exports = async function () {
  if (process.env.__TEST_TMP_DIR__) {
    fs.rmSync(process.env.__TEST_TMP_DIR__, { recursive: true, force: true });
  }
};
