# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs both client :5173 and server :3001 concurrently)
npm run dev

# Production build (client only — outputs to client/dist/)
npm run build

# Start production server (serves built client as static files)
npm start

# Run all tests
npm test

# Run server tests only (Jest + Supertest)
npm run test -w server

# Run client tests only (Vitest + Testing Library)
npm run test -w client

# Run a single server test file
cd server && npx jest tests/sessions.test.js --runInBand

# Run a single client test file
cd client && npx vitest run tests/pages/QuizFlow.test.jsx
```

## Architecture

npm workspaces monorepo with two packages: `server/` and `client/`.

### Server (`server/src/`)

Express + Socket.io on port 3001. All state persists in MongoDB (Atlas in production, local `mongodb://localhost:27017/cs-reflection-quiz` in dev). Two collections: `questions` and `sessions`.

`data/db.js` — lazy singleton: `getDb()` auto-connects on first call; `connect()` also creates the `sessionId` unique index. `data/store.js` exposes async helpers (`readQuestions`, `writeSession`, etc.) used by all routes and socket handlers. `data/questions.json` is the seed file — loaded by `index.js` if the `questions` collection is empty on startup.

**Critical invariant:** `POST /api/sessions` snapshots the question bank into `session.questions` at creation time. Subsequent edits to the global bank must never touch existing sessions.

Socket.io rooms are keyed by PIN. Teacher and all students share one room per session. Events: `student:join`, `student:answer` (supports re-answering previous questions — upserts by `questionId`), `student:finish`, `teacher:watch`, `teacher:roster_update`, `session:state`, `session:joined`.

In production (`NODE_ENV=production`), Express also serves `client/dist/` as static files with SPA fallback.

### Client (`client/src/`)

React 18 + Vite + Tailwind CSS + React Router v6. All UI is Hebrew RTL — `dir="rtl"` is set on `<html>` in `index.html` and reinforced by `RTLLayout.jsx`. Use Tailwind logical properties (`ms-*`, `me-*`) not directional ones (`ml-*`, `mr-*`). Recharts charts must be wrapped in a `dir="ltr"` container to prevent axis mirroring.

**Socket singleton:** `socket.js` exports `getSocket()` — a lazy singleton with `autoConnect: false`. Connect explicitly before emitting.

**Teacher auth:** `sessionStorage` key `teacherAuth`. `TeacherGuard` wraps all `/teacher/*` routes. Password is hardcoded in `TeacherLogin.jsx` (`2002`).

**Student quiz flow:** `useStudentQuiz` hook manages local answer state (keyed by `questionId`) and dual-writes — updates local state immediately and emits to socket. This lets the UI advance without waiting for server round-trips. Supports back-navigation: going back pre-fills the saved answer.

**Routes:**
- `/teacher` → teacher home (guarded)
- `/teacher/login` → password page
- `/teacher/monitor/:pin` → live roster (guarded)
- `/teacher/analytics/:pin` → analytics with per-question and per-student tabs (guarded)
- `/teacher/questions` → question bank manager (guarded)
- `/teacher/preview` → quiz preview with correct answers + explanations (guarded)
- `/join` → student join screen
- `/quiz/:pin` → student quiz flow
- `/done` → completion screen

### Data model

```
Question: { id, title, codeSnippet, questionText, options[4], correctAnswerIndex, answerExplanations[4] }
Session:  { sessionId, createdAt, className, questions (snapshot), students[] }
Student:  { studentId, name, currentQuestionIndex, answers[], finished }
Answer:   { questionId, selectedOptionIndex, confidenceLevel (1-5), explanation }
```

### Tests

Server tests use `globalSetup`/`globalTeardown` with `mongodb-memory-server` — `globalSetup` starts an in-memory MongoDB, sets `MONGODB_URI`, and stores the instance in `global.__MONGOD__`; `globalTeardown` stops it. Each test suite that modifies the question bank calls `writeQuestions(require('../src/data/questions.json'))` in `beforeAll` to reset state. Run with `--runInBand --forceExit` (configured in `server/package.json`). `index.js` only binds to a port when run as the main module (`require.main === module`), so `require('../src/index')` in tests is safe.

Client tests mock `../../src/socket` with `vi.mock(...)` to avoid real socket connections. `ResizeObserver` is polyfilled in `tests/setup.js` for Recharts compatibility.

### Deployment

Deployed to Render (free tier). `render.yaml` at repo root configures build/start commands and `NODE_ENV=production`. Requires `MONGODB_URI` env var set in the Render dashboard pointing to a MongoDB Atlas cluster. On startup, if the `questions` collection is empty, `index.js` seeds it from `server/src/data/questions.json`.
