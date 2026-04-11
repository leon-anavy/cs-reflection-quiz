const { v4: uuidv4 } = require('uuid');
const { readSession, writeSession } = require('../data/store');

function registerHandlers(io) {
  io.on('connection', (socket) => {
    // Teacher watching a session
    socket.on('teacher:watch', ({ pin }) => {
      const normalizedPin = pin.toUpperCase();
      socket.join(normalizedPin);
      const session = readSession(normalizedPin);
      if (session) {
        socket.emit('session:state', session);
      }
    });

    // Student joins a session
    socket.on('student:join', ({ pin, name }) => {
      const normalizedPin = pin.toUpperCase();
      const session = readSession(normalizedPin);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      const studentId = uuidv4();
      const student = {
        studentId,
        name,
        currentQuestionIndex: 0,
        answers: []
      };

      session.students.push(student);
      writeSession(normalizedPin, session);

      socket.join(normalizedPin);
      socket.emit('session:joined', { session, studentId });

      // Notify teacher
      io.to(normalizedPin).emit('teacher:roster_update', session.students);
    });

    // Student submits an answer
    socket.on('student:answer', ({ pin, studentId, answer }) => {
      const normalizedPin = pin.toUpperCase();
      const session = readSession(normalizedPin);
      if (!session) return;

      const student = session.students.find(s => s.studentId === studentId);
      if (!student) return;

      student.answers.push(answer);
      student.currentQuestionIndex = Math.min(
        student.currentQuestionIndex + 1,
        session.questions.length
      );

      writeSession(normalizedPin, session);
      io.to(normalizedPin).emit('teacher:roster_update', session.students);
    });

    // Student finishes the quiz
    socket.on('student:finish', ({ pin, studentId }) => {
      const normalizedPin = pin.toUpperCase();
      const session = readSession(normalizedPin);
      if (!session) return;

      const student = session.students.find(s => s.studentId === studentId);
      if (!student) return;

      student.finished = true;
      writeSession(normalizedPin, session);
      io.to(normalizedPin).emit('teacher:roster_update', session.students);
    });
  });
}

module.exports = registerHandlers;
