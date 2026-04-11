import { useNavigate } from 'react-router-dom';

export default function SessionCard({ session }) {
  const navigate = useNavigate();
  const date = new Date(session.createdAt).toLocaleString('he-IL');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-blue-700 text-lg tracking-widest">{session.sessionId}</span>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
      {session.className && (
        <p className="text-sm text-gray-600">{session.className}</p>
      )}
      <p className="text-sm text-gray-500">{session.studentCount} תלמידים</p>
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => navigate(`/teacher/monitor/${session.sessionId}`)}
          className="flex-1 text-sm bg-blue-50 text-blue-700 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors font-medium"
        >
          מעקב חי
        </button>
        <button
          onClick={() => navigate(`/teacher/analytics/${session.sessionId}`)}
          className="flex-1 text-sm bg-purple-50 text-purple-700 rounded-lg px-3 py-2 hover:bg-purple-100 transition-colors font-medium"
        >
          ניתוח
        </button>
        <a
          href={`/api/export/${session.sessionId}/csv`}
          className="flex-1 text-sm bg-gray-50 text-gray-700 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors font-medium text-center"
        >
          ייצוא CSV
        </a>
      </div>
    </div>
  );
}
