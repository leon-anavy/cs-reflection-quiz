import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../socket';

export default function JoinScreen() {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const canSubmit = pin.trim().length === 5 && name.trim().length > 0;

  async function handleJoin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/sessions/${pin.trim().toUpperCase()}`);
      if (!res.ok) {
        setError('קוד מבדק לא נמצא. בדוק שוב.');
        setLoading(false);
        return;
      }
      const session = await res.json();

      const socket = getSocket();
      if (!socket.connected) socket.connect();

      socket.emit('student:join', { pin: session.sessionId, name: name.trim() });

      socket.once('session:joined', ({ session: joinedSession, studentId }) => {
        navigate(`/quiz/${session.sessionId}`, {
          state: { session: joinedSession, studentId }
        });
      });

      socket.once('error', (err) => {
        setError(err.message || 'שגיאה בהצטרפות');
        setLoading(false);
      });
    } catch {
      setError('שגיאת רשת. נסה שוב.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">מבדק רפלקציה</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">הזן קוד מבדק ושמך כדי להצטרף</p>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קוד מבדק</label>
            <input
              type="text"
              value={pin}
              onChange={e => setPin(e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="לדוגמה: A3K7B"
              dir="ltr"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם התלמיד</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="הכנס את שמך"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 mt-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {loading ? 'מתחבר...' : 'הצטרף למבדק'}
          </button>
        </form>
      </div>
    </div>
  );
}
