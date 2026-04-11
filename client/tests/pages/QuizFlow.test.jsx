import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

const mockEmit = vi.fn();
vi.mock('../../src/socket', () => ({
  getSocket: () => ({
    connected: true,
    connect: vi.fn(),
    emit: mockEmit,
    once: vi.fn()
  })
}));

import QuizFlow from '../../src/pages/student/QuizFlow';

const mockSession = {
  sessionId: 'TEST1',
  questions: [
    {
      id: 'q1',
      title: 'שאלה 1',
      questionText: 'מה יודפס?',
      codeSnippet: '',
      options: ['א', 'ב', 'ג', 'ד'],
      correctAnswerIndex: 1
    },
    {
      id: 'q2',
      title: 'שאלה 2',
      questionText: 'מה הפלט?',
      codeSnippet: '',
      options: ['1', '2', '3', '4'],
      correctAnswerIndex: 0
    }
  ],
  students: []
};

function renderQuizFlow(state = { session: mockSession, studentId: 'stu-1' }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/quiz/TEST1', state }]}>
      <Routes>
        <Route path="/quiz/:pin" element={<QuizFlow />} />
        <Route path="/join" element={<div>Join Page</div>} />
        <Route path="/done" element={<div>Done Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('QuizFlow', () => {
  beforeEach(() => mockEmit.mockClear());

  test('"הבא" button is disabled until all three fields are filled', () => {
    renderQuizFlow();
    expect(screen.getByRole('button', { name: /שאלה הבאה/i })).toBeDisabled();
  });

  test('button enabled after filling option, confidence, and explanation', async () => {
    renderQuizFlow();
    // Select option
    await userEvent.click(screen.getByRole('button', { name: /^ב/ }));
    // Select confidence level 3
    await userEvent.click(screen.getByText('3'));
    // Fill explanation
    await userEvent.type(screen.getByPlaceholderText(/כתוב/i), 'כי כך לומדתי');

    expect(screen.getByRole('button', { name: /שאלה הבאה/i })).not.toBeDisabled();
  });

  test('emits student:answer socket event on submit', async () => {
    renderQuizFlow();
    await userEvent.click(screen.getByRole('button', { name: /^ב/ }));
    await userEvent.click(screen.getByText('3'));
    await userEvent.type(screen.getByPlaceholderText(/כתוב/i), 'הסבר');
    await userEvent.click(screen.getByRole('button', { name: /שאלה הבאה/i }));

    expect(mockEmit).toHaveBeenCalledWith('student:answer', expect.objectContaining({
      pin: 'TEST1',
      studentId: 'stu-1'
    }));
  });

  test('advances to next question after submission', async () => {
    renderQuizFlow();
    expect(screen.getByText('שאלה 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^ב/ }));
    await userEvent.click(screen.getByText('3'));
    await userEvent.type(screen.getByPlaceholderText(/כתוב/i), 'הסבר');
    await userEvent.click(screen.getByRole('button', { name: /שאלה הבאה/i }));

    await waitFor(() => {
      expect(screen.getByText('שאלה 2')).toBeInTheDocument();
    });
  });

  test('shows completion message after final question', async () => {
    // Single-question session
    const singleQ = { ...mockSession, questions: [mockSession.questions[0]] };
    renderQuizFlow({ session: singleQ, studentId: 'stu-1' });

    await userEvent.click(screen.getByRole('button', { name: /^ב/ }));
    await userEvent.click(screen.getByText('3'));
    await userEvent.type(screen.getByPlaceholderText(/כתוב/i), 'הסבר');
    await userEvent.click(screen.getByRole('button', { name: /סיום המבדק/i }));

    await waitFor(() => {
      expect(screen.getByText(/תודה רבה/i)).toBeInTheDocument();
    });
  });

  test('redirects to /join when no session state', async () => {
    renderQuizFlow(null);
    await waitFor(() => {
      expect(screen.getByText('Join Page')).toBeInTheDocument();
    });
  });
});
