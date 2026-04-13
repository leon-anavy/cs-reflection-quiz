import { useState, useCallback } from 'react';
import { getSocket } from '../socket';

export function useStudentQuiz(session, studentId) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers keyed by questionId for easy lookup and update
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const submitAnswer = useCallback((answer) => {
    const socket = getSocket();
    setAnswers(prev => ({ ...prev, [answer.questionId]: answer }));

    const isLast = currentIndex + 1 >= session.questions.length;
    socket.emit('student:answer', {
      pin: session.sessionId,
      studentId,
      answer,
      questionIndex: currentIndex,
      isLast
    });

    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }, [answers, currentIndex, session, studentId]);

  const goBack = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  // Return existing answer for a given question (for pre-filling the form)
  function getAnswer(questionId) {
    return answers[questionId] || null;
  }

  return { currentIndex, answers, finished, submitAnswer, goBack, getAnswer };
}
