import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import QuestionStatCard from '../../components/teacher/QuestionStatCard';

const OPTION_LABELS = ['א', 'ב', 'ג', 'ד'];

function StudentAnalysisCard({ student, questions }) {
  const [expanded, setExpanded] = useState(false);

  const answeredCount = student.answers.length;
  const correctCount = student.answers.filter(a => {
    const q = questions.find(q => q.id === a.questionId);
    return q && a.selectedOptionIndex === q.correctAnswerIndex;
  }).length;
  const score = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const avgConf = answeredCount > 0
    ? (student.answers.reduce((s, a) => s + a.confidenceLevel, 0) / answeredCount).toFixed(1)
    : '—';
  const finished = student.finished || student.currentQuestionIndex >= questions.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900">{student.name}</span>
          {finished
            ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">סיים</span>
            : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{answeredCount}/{questions.length}</span>
          }
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-black text-blue-700">{score}%</span>
          <span className="text-gray-400 text-xs">ביטחון {avgConf}</span>
          {answeredCount > 0 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-blue-500 hover:text-blue-700 text-xs font-medium"
            >
              {expanded ? '▲ הסתר' : '▼ פירוט'}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {questions.map((q, idx) => {
            const answer = student.answers.find(a => a.questionId === q.id);
            if (!answer) return (
              <div key={q.id} className="flex items-center gap-2 text-sm text-gray-400 py-1">
                <span className="w-5 text-center">{idx + 1}.</span>
                <span>לא ענה</span>
              </div>
            );
            const isCorrect = answer.selectedOptionIndex === q.correctAnswerIndex;
            return (
              <div key={q.id} className={`rounded-lg px-3 py-2 text-sm border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 shrink-0">{idx + 1}.</span>
                    <span className="font-medium text-gray-800">{q.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-bold text-xs ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {OPTION_LABELS[answer.selectedOptionIndex]} {isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-400 text-xs">ביטחון {answer.confidenceLevel}</span>
                  </div>
                </div>
                {answer.explanation && (
                  <p className="mt-1 text-gray-600 text-xs me-6">{answer.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { session, loading, error } = useSession(pin);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'students'

  if (loading) return <div className="text-center py-20 text-gray-400">טוען...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const { students, questions } = session;
  const totalStudents = students.length;

  const allAnswers = students.flatMap(s => s.answers);
  const answered = allAnswers.length;
  const correctCount = allAnswers.filter(a => {
    const q = questions.find(q => q.id === a.questionId);
    return q && a.selectedOptionIndex === q.correctAnswerIndex;
  }).length;
  const avgScore = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;
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

      {students.length === 0 ? (
        <p className="text-center text-gray-400 py-10">אין נתוני תלמידים עדיין</p>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5 gap-1">
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
                ${activeTab === 'questions' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ניתוח לפי שאלה
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
                ${activeTab === 'students' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ניתוח לפי תלמיד
            </button>
          </div>

          {activeTab === 'questions' && (
            <div className="flex flex-col gap-4">
              {questions.map((q, idx) => (
                <QuestionStatCard key={q.id} question={q} students={students} index={idx} />
              ))}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="flex flex-col gap-3">
              {students.map(s => (
                <StudentAnalysisCard key={s.studentId} student={s} questions={questions} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
