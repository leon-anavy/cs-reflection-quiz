import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import JoinScreen from '../../src/pages/student/JoinScreen';

// Mock socket
vi.mock('../../src/socket', () => ({
  getSocket: () => ({
    connected: false,
    connect: vi.fn(),
    emit: vi.fn(),
    once: vi.fn()
  })
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderJoinScreen() {
  return render(
    <MemoryRouter>
      <JoinScreen />
    </MemoryRouter>
  );
}

describe('JoinScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  test('submit button disabled when inputs are empty', () => {
    renderJoinScreen();
    const button = screen.getByRole('button', { name: /הצטרף/i });
    expect(button).toBeDisabled();
  });

  test('submit button disabled when only PIN is filled', async () => {
    renderJoinScreen();
    await userEvent.type(screen.getByPlaceholderText(/A3K7B/i), 'ABCDE');
    const button = screen.getByRole('button', { name: /הצטרף/i });
    expect(button).toBeDisabled();
  });

  test('shows error message on 404 response (invalid PIN)', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    renderJoinScreen();
    await userEvent.type(screen.getByPlaceholderText(/A3K7B/i), 'ZZZZZ');
    await userEvent.type(screen.getByPlaceholderText(/שמך/i), 'דנה');
    await userEvent.click(screen.getByRole('button', { name: /הצטרף/i }));

    await waitFor(() => {
      expect(screen.getByText(/לא נמצא/i)).toBeInTheDocument();
    });
  });

  test('calls fetch with correct PIN (uppercase)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: 'ABCDE', questions: [], students: [] })
    });

    renderJoinScreen();
    await userEvent.type(screen.getByPlaceholderText(/A3K7B/i), 'abcde');
    await userEvent.type(screen.getByPlaceholderText(/שמך/i), 'דנה');
    await userEvent.click(screen.getByRole('button', { name: /הצטרף/i }));

    expect(global.fetch).toHaveBeenCalledWith('/api/sessions/ABCDE');
  });
});
