import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionCard from '../../components/teacher/SessionCard';

export default function HomePage() {
  const [sessions, setSessions] = useState([]);
  const [className, setClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const importRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(setSessions)
      .catch(() => {});
  }, []);

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const session = JSON.parse(text);
      const res = await fetch('/api/sessions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      if (!res.ok) throw new Error('שגיאה בייבוא');
      const data = await res.json();
      navigate(`/teacher/analytics/${data.sessionId}`);
    } catch {
      alert('קובץ לא תקין — יש לייבא קובץ JSON שיוצא מהמערכת');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ className })
    });
    const data = await res.json();
    setCreating(false);
    navigate(`/teacher/monitor/${data.sessionId}`);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">לוח בקרה — מורה</h1>
          <p className="text-gray-500 text-sm mt-1">ניהול מבדקי רפלקציה</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => navigate('/teacher/preview')}
            className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            תצוגה מקדימה
          </button>
          <button
            onClick={() => navigate('/teacher/questions')}
            className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            בנק שאלות
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button
            onClick={() => importRef.current.click()}
            disabled={importing}
            className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            {importing ? 'מייבא...' : 'ייבוא מבדק'}
          </button>
        </div>
      </div>

      {/* Create new session */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
        <h2 className="font-bold text-lg mb-1">צור מבדק חדש</h2>
        <p className="text-blue-100 text-sm mb-4">פעולה זו תיצור עותק של בנק השאלות הנוכחי</p>
        {showForm ? (
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={className}
              onChange={e => setClassName(e.target.value)}
              placeholder="שם הכיתה (אופציונלי)"
              className="flex-1 rounded-xl px-4 py-2 text-gray-900 focus:outline-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-white text-blue-700 font-bold px-5 py-2 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              {creating ? 'יוצר...' : 'צור'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-blue-200 hover:text-white px-2">ביטול</button>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            + צור מבדק חדש
          </button>
        )}
      </div>

      {/* Session list */}
      <h2 className="font-bold text-gray-800 mb-3">מבדקים קודמים</h2>
      {sessions.length === 0 ? (
        <p className="text-gray-400 text-center py-8">אין מבדקים עדיין</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map(s => (
            <SessionCard key={s.sessionId} session={s} onDelete={id => setSessions(prev => prev.filter(s => s.sessionId !== id))} />
          ))}
        </div>
      )}
    </div>
  );
}
