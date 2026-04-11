import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TEACHER_PASSWORD = '2002';

export function isTeacherAuthenticated() {
  return sessionStorage.getItem('teacherAuth') === 'true';
}

export default function TeacherLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/teacher';

  function handleSubmit(e) {
    e.preventDefault();
    if (password === TEACHER_PASSWORD) {
      sessionStorage.setItem('teacherAuth', 'true');
      navigate(from, { replace: true });
    } else {
      setError('סיסמה שגויה. נסה שוב.');
      setPassword('');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">כניסת מורה</h1>
        <p className="text-gray-500 text-center text-sm mb-6">הזן סיסמה להמשך</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="סיסמה"
            autoFocus
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-400"
          />

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password}
            className="w-full bg-slate-700 text-white font-semibold rounded-xl py-3 disabled:opacity-40 hover:bg-slate-800 transition-colors"
          >
            כניסה
          </button>
        </form>
      </div>
    </div>
  );
}
