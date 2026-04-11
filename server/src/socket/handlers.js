const { v4: uuidv4 } = require('uuid');
const { readSession, writeSession } = require('../data/store');

function registerHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('teacher:watch', async ({ pin }) => {
      const normalizedPin = pin.toUpperCase();
      socket.join(normalizedPin);
      const session = await readSession(normalizedPin);
      if (session) socket.emit('session:state', session);
    });

    socket.on('student:join', async ({ pin, name }) => {
      const normalizedPin = pin.toUpperCase();
      const session = await readSession(normalizedPin);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      const studentId = uuidv4();
      const student = { studentId, name, currentQuestionIndex: 0, answers: [] };
      session.students.push(student);
      await writeSession(normalizedPin, session);

      socket.join(normalizedPin);
      socket.emit('session:joined', { session, studentId });
      io.to(normalizedPin).emit('teacher:roster_update', session.students);
    });

    socket.on('student:answer', async ({ pin, studentId, answer, questionIndex }) => {
      const normalizedPin = pin.toUpperCase();
      const session = await readSession(normalizedPin);
      if (!session) return;

      const student = session.students.find(s => s.studentId === studentId);
      if (!student) return;

      const existingIdx = student.answers.findIndex(a => a.questionId === answer.questionId);
      if (existingIdx >= 0) {
        student.answers[existingIdx] = answer;
      } else {
        student.answers.push(answer);
      }

      const nextIndex = (questionIndex ?? 0) + 1;
      student.currentQuestionIndex = Math.max(
        student.currentQuestionIndex,
        Math.min(nextIndex, session.questions.length)
      );

      await writeSession(normalizedPin, session);
      io.to(normalizedPin).emit('teacher:roster_update', session.students);
    });

    socket.on('student:finish', async ({ pin, studentId }) => {
      const normalizedPin = pin.toUpperCase();
      const session = await readSession(normalizedPin);
      if (!session) return;

      const student = session.students.find(s => s.studentId === studentId);
      if (!student) return;

      student.finished = true;
      await writeSession(normalizedPin, session);
      io.to(normalizedPin).emit('teacher:roster_update', session.students);
    });
  });
}

module.exports = registerHandlers;
