import { render, screen } from '@testing-library/react';
import QuestionStatCard from '../../src/components/teacher/QuestionStatCard';

const question = {
  id: 'q1',
  title: 'Test Q',
  questionText: 'What does this print?',
  codeSnippet: '',
  options: ['A', 'B', 'C', 'D'],
  correctAnswerIndex: 1
};

function makeStudents(answers) {
  return answers.map((a, i) => ({
    studentId: `s${i}`,
    name: `Student ${i}`,
    currentQuestionIndex: 1,
    finished: true,
    answers: [a]
  }));
}

describe('QuestionStatCard', () => {
  test('renders accuracy percentage correctly', () => {
    const students = makeStudents([
      { questionId: 'q1', selectedOptionIndex: 1, confidenceLevel: 3, explanation: 'ok' },
      { questionId: 'q1', selectedOptionIndex: 0, confidenceLevel: 3, explanation: 'no' }
    ]);
    render(<QuestionStatCard question={question} students={students} index={0} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('shows red flag warning when confidence >= 4 and accuracy < 50%', () => {
    const students = makeStudents([
      { questionId: 'q1', selectedOptionIndex: 0, confidenceLevel: 5, explanation: 'sure' },
      { questionId: 'q1', selectedOptionIndex: 0, confidenceLevel: 4, explanation: 'sure' }
    ]);
    render(<QuestionStatCard question={question} students={students} index={0} />);
    expect(screen.getByText(/אמון גבוה/)).toBeInTheDocument();
  });

  test('does NOT show warning when accuracy >= 50%', () => {
    const students = makeStudents([
      { questionId: 'q1', selectedOptionIndex: 1, confidenceLevel: 5, explanation: 'ok' },
      { questionId: 'q1', selectedOptionIndex: 1, confidenceLevel: 5, explanation: 'ok' }
    ]);
    render(<QuestionStatCard question={question} students={students} index={0} />);
    expect(screen.queryByText(/אמון גבוה/)).not.toBeInTheDocument();
  });

  test('does NOT show warning when avg confidence < 4', () => {
    const students = makeStudents([
      { questionId: 'q1', selectedOptionIndex: 0, confidenceLevel: 2, explanation: 'no' },
      { questionId: 'q1', selectedOptionIndex: 0, confidenceLevel: 3, explanation: 'no' }
    ]);
    render(<QuestionStatCard question={question} students={students} index={0} />);
    expect(screen.queryByText(/אמון גבוה/)).not.toBeInTheDocument();
  });
});
