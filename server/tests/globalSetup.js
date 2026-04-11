const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = async function () {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-quiz-test-'));
  fs.mkdirSync(path.join(tmpDir, 'sessions'), { recursive: true });

  const src = path.join(__dirname, '..', 'src', 'data', 'questions.json');
  fs.copyFileSync(src, path.join(tmpDir, 'questions.json'));

  process.env.DATA_DIR = tmpDir;
  process.env.__TEST_TMP_DIR__ = tmpDir;
};
