import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import { useSocketRoom } from '../../hooks/useSocketRoom';
import { getSocket } from '../../socket';
import PinDisplay from '../../components/common/PinDisplay';
import StudentRow from '../../components/teacher/StudentRow';

export default function LiveMonitor() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { session, loading, error } = useSession(pin);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (session) setStudents(session.students);
  }, [session]);

  // Connect socket and watch the session
  useEffect(() => {
    if (!pin) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('teacher:watch', { pin });
    socket.on('teacher:roster_update', setStudents);
    return () => { socket.off('teacher:roster_update', setStudents); };
  }, [pin]);

  if (loading) return <div className="text-center py-20 text-gray-400">טוען...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const totalQuestions = session.questions.length;
  const finished = students.filter(s => s.finished || s.currentQuestionIndex >= totalQuestions).length;

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <button onClick={() => navigate('/teacher')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1">
        ← חזרה
      </button>

      {/* PIN Display */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <p className="text-gray-600 font-medium">שתף עם התלמידים:</p>
        <PinDisplay pin={pin} />
        <p className="text-sm text-gray-400">כתובת להצטרפות: <span dir="ltr" className="font-mono">/join</span></p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{students.length}</p>
          <p className="text-xs text-gray-500">תלמידים</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-green-600">{finished}</p>
          <p className="text-xs text-gray-500">סיימו</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{students.length - finished}</p>
          <p className="text-xs text-gray-500">בתהליך</p>
        </div>
      </div>

      {/* Roster */}
      <div className="flex flex-col gap-2">
        {students.length === 0 ? (
          <p className="text-center text-gray-400 py-10">ממתין להצטרפות תלמידים...</p>
        ) : (
          students.map(s => (
            <StudentRow
              key={s.studentId}
              student={s}
              totalQuestions={totalQuestions}
              onDelete={async (studentId) => {
                await fetch(`/api/sessions/${pin}/students/${studentId}`, { method: 'DELETE' });
                setStudents(prev => prev.filter(s => s.studentId !== studentId));
              }}
            />
          ))
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate(`/teacher/analytics/${pin}`)}
          className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
        >
          צפה בניתוח תוצאות
        </button>
      </div>
    </div>
  );
}
