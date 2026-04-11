import { useState, useCallback } from 'react';
import { getSocket } from '../socket';

export function useStudentQuiz(session, studentId) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const submitAnswer = useCallback((answer) => {
    const socket = getSocket();
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    socket.emit('student:answer', {
      pin: session.sessionId,
      studentId,
      answer
    });

    const nextIndex = currentIndex + 1;
    if (nextIndex >= session.questions.length) {
      socket.emit('student:finish', { pin: session.sessionId, studentId });
      setFinished(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [answers, currentIndex, session, studentId]);

  return { currentIndex, answers, finished, submitAnswer };
}
