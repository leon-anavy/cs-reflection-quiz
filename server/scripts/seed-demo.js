// Seeds 2 demo sessions via the REST API.
// The server must be running first (npm run dev).
// Usage: node server/scripts/seed-demo.js [base_url]
// Default base_url: http://localhost:3001

const http = require('http');
const https = require('https');

const BASE = (process.argv[2] || 'http://localhost:3001').replace(/\/$/, '');

// correctAnswerIndex per question id
const CORRECT = { q1: 1, q2: 1, q3: 2, q4: 3, q5: 0, q6: 2, q7: 1 };

const EXPLANATIONS = {
  strong: {
    q1: 'חלוקת שלמים ב-Java תמיד מחזירה int, ולכן 7/2=3. שני חלקי התנאי מתקיימים ולכן y = 3.0 + 2.5',
    q2: 'x=8 זוגי אז מופעל ה-else: (int)(4.0+0.6)=4 נשמר כ-4.0',
    q3: 'nextInt(5) מחזיר 0–4, חיבור של 1 נותן 1–5, לכן האותיות הן B עד F',
    q4: 'כשi=5 מנסים לגשת לאינדקס 5 שלא קיים במערך, זו שגיאת זמן ריצה',
    q5: 'Java מעבירה פרימיטיבים בעותק, שינוי של x בפעולה לא משפיע על a במקור',
    q6: 'b[0]=99 משנה את arr, אבל אחרי b=new int[] ב עוד לא מצביע על arr',
    q7: '== משווה כתובות זיכרון לא תוכן, substring יוצר אובייקט חדש'
  },
  average: {
    q1: 'חשבתי שחלוקה של double תתן תוצאה עשרונית',
    q2: 'ניסיתי כמה ערכים וראיתי שרק 8 נותן 4.0',
    q3: 'nextInt(5) נותן 0 עד 4, חיבור 1 נותן 1 עד 5',
    q4: 'הלולאה מתחילה מ-1 ומגיעה ל-nums.length שהוא 5, אז nums[5] לא קיים',
    q5: 'כל פעם שמעבירים int לפעולה זה עותק',
    q6: 'לא הבנתי מתי ה-b מנותק מ-arr',
    q7: 'צריך להשתמש ב-equals ולא ב-=='
  },
  weak: {
    q1: 'חשבתי שdouble y=x/2 יתן 3.5',
    q2: 'לא הבנתי את הלוגיקה של התנאים',
    q3: 'לא ידעתי את הטווח של nextInt',
    q4: 'חשבתי שהלולאה תסכם נכון',
    q5: 'חשבתי ש-x=x*2 ישנה את a',
    q6: 'חשבתי שהכל מושפע מה-b החדש',
    q7: 'חשבתי ש-== משווה תוכן'
  }
};

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const lib = url.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function makeStudentId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function makeAnswers(questions, profile, overrideConf) {
  return questions.map(q => {
    const correct = CORRECT[q.id] ?? 0;
    let chosen;
    if (profile === 'strong') {
      chosen = q.id === 'q6' ? (correct + 1) % 4 : correct;
    } else if (profile === 'average') {
      chosen = ['q2', 'q3', 'q6'].includes(q.id) ? (correct + 2) % 4 : correct;
    } else {
      chosen = ['q5', 'q7'].includes(q.id) ? correct : (correct + 1) % 4;
    }
    const baseConf = overrideConf ?? { strong: 5, average: 3, weak: 2 }[profile];
    return {
      questionId: q.id,
      selectedOptionIndex: chosen,
      confidenceLevel: Math.max(1, baseConf + (Math.random() > 0.5 ? 0 : -1)),
      explanation: EXPLANATIONS[profile][q.id] || 'לא כתבתי הסבר'
    };
  });
}

function makeStudent(name, questions, profile, overrideConf) {
  return {
    studentId: makeStudentId(),
    name,
    currentQuestionIndex: questions.length,
    answers: makeAnswers(questions, profile, overrideConf),
    finished: true
  };
}

async function seed() {
  // Fetch the current question bank
  const qRes = await request('GET', '/api/questions');
  if (qRes.status !== 200 || !Array.isArray(qRes.body) || qRes.body.length === 0) {
    console.error('Could not fetch questions. Is the server running at', BASE, '?');
    process.exit(1);
  }
  const questions = qRes.body;
  console.log(`Loaded ${questions.length} questions`);

  const now = new Date();

  // Session 1: כיתה י1 — varied performance
  const session1 = {
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    className: 'כיתה י1 — הדגמה',
    questions,
    students: [
      makeStudent('נועה כהן', questions, 'strong'),
      makeStudent('יוסי לוי', questions, 'strong'),
      makeStudent('שירה מזרחי', questions, 'average'),
      makeStudent('אדם פרץ', questions, 'average'),
      makeStudent('טל שמיר', questions, 'weak'),
      makeStudent('ליאור בן-דוד', questions, 'weak'),
    ]
  };

  const r1 = await request('POST', '/api/sessions/import', session1);
  if (r1.status !== 201) { console.error('Failed to import session 1:', r1.body); process.exit(1); }
  console.log(`Session 1 created: ${r1.body.sessionId} (כיתה י1)`);

  // Session 2: כיתה י2 — includes "high confidence, low accuracy" students
  const session2 = {
    createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    className: 'כיתה י2 — הדגמה',
    questions,
    students: [
      makeStudent('רון אברהם', questions, 'strong'),
      makeStudent('מיכל גרין', questions, 'average'),
      makeStudent('עומר דוד', questions, 'average'),
      makeStudent('הילה כץ', questions, 'weak', 5),   // all wrong, high confidence → flag
      makeStudent('גל עמר', questions, 'weak', 4),    // all wrong, high confidence → flag
      makeStudent('ניר שפירא', questions, 'weak'),
      makeStudent('אורי טל', questions, 'weak'),
    ]
  };

  const r2 = await request('POST', '/api/sessions/import', session2);
  if (r2.status !== 201) { console.error('Failed to import session 2:', r2.body); process.exit(1); }
  console.log(`Session 2 created: ${r2.body.sessionId} (כיתה י2)`);

  console.log('\nDone! Open the teacher dashboard to see the demo sessions.');
}

seed().catch(err => { console.error(err.message); process.exit(1); });
