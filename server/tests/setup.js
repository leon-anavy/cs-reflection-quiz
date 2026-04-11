const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-quiz-test-'));
  fs.mkdirSync(path.join(tmpDir, 'sessions'), { recursive: true });

  // Copy real questions.json as test fixture
  const src = path.join(__dirname, '..', 'src', 'data', 'questions.json');
  fs.copyFileSync(src, path.join(tmpDir, 'questions.json'));

  process.env.DATA_DIR = tmpDir;
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.DATA_DIR;
});
