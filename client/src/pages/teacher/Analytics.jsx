import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import QuestionStatCard from '../../components/teacher/QuestionStatCard';

export default function Analytics() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { session, loading, error } = useSession(pin);

  if (loading) return <div className="text-center py-20 text-gray-400">טוען...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const { students, questions } = session;
  const totalStudents = students.length;

  const allAnswers = students.flatMap(s => s.answers);
  const answered = allAnswers.length;
  const correctAnswers = allAnswers.filter(a => {
    const q = questions.find(q => q.id === a.questionId);
    return q && a.selectedOptionIndex === q.correctAnswerIndex;
  });
  const avgScore = answered > 0 ? Math.round((correctAnswers.length / answered) * 100) : 0;
  const avgConfidence = answered > 0
    ? (allAnswers.reduce((s, a) => s + a.confidenceLevel, 0) / answered).toFixed(1)
    : '—';

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/teacher/monitor/${pin}`)} className="text-sm text-gray-500 hover:text-gray-700">← חזרה</button>
        <h1 className="text-2xl font-black text-gray-900">ניתוח תוצאות</h1>
        <span className="font-mono text-blue-700 font-bold text-lg">{pin}</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{totalStudents}</p>
          <p className="text-xs text-gray-500">תלמידים</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{avgScore}%</p>
          <p className="text-xs text-gray-500">דיוק ממוצע</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-indigo-600">{avgConfidence}</p>
          <p className="text-xs text-gray-500">ביטחון ממוצע</p>
        </div>
      </div>

      {/* Export */}
      <div className="flex gap-2 mb-6">
        <a href={`/api/export/${pin}/csv`} className="flex-1 text-center text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors font-medium">
          ייצוא CSV
        </a>
        <a href={`/api/export/${pin}/json`} className="flex-1 text-center text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors font-medium">
          ייצוא JSON
        </a>
      </div>

      {/* Per-question */}
      {students.length === 0 ? (
        <p className="text-center text-gray-400 py-10">אין נתוני תלמידים עדיין</p>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q, idx) => (
            <QuestionStatCard key={q.id} question={q} students={students} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
