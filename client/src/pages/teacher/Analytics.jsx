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
  const incorrectCount = answeredCount - correctCount;
  const unansweredCount = questions.length - answeredCount;
  const score = answeredCount > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const avgConf = answeredCount > 0
    ? (student.answers.reduce((s, a) => s + a.confidenceLevel, 0) / answeredCount).toFixed(1)
    : null;
  const finished = student.finished || student.currentQuestionIndex >= questions.length;
  const highConfLowAcc = avgConf !== null && parseFloat(avgConf) >= 4 && answeredCount > 0 && (correctCount / answeredCount) < 0.5;

  const correctPct = (correctCount / questions.length) * 100;
  const incorrectPct = (incorrectCount / questions.length) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-900">{student.name}</span>
          {finished
            ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">סיים</span>
            : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{answeredCount}/{questions.length} שאלות</span>
          }
          {highConfLowAcc && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">ביטחון גבוה, ביצועים נמוכים</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm shrink-0">
          <div className="text-center">
            <span className="font-black text-blue-700 text-base">{score}%</span>
            <span className="block text-gray-400 text-xs">דיוק</span>
          </div>
          {avgConf !== null && (
            <div className="text-center">
              <span className="font-bold text-indigo-600 text-base">{avgConf}</span>
              <span className="block text-gray-400 text-xs">ביטחון</span>
            </div>
          )}
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

      {/* Progress bar */}
      {answeredCount > 0 && (
        <div className="flex rounded-full overflow-hidden h-2 mb-1 gap-px">
          {correctCount > 0 && <div className="bg-green-400" style={{ width: `${correctPct}%` }} title={`${correctCount} נכון`} />}
          {incorrectCount > 0 && <div className="bg-red-400" style={{ width: `${incorrectPct}%` }} title={`${incorrectCount} שגוי`} />}
          {unansweredCount > 0 && <div className="bg-gray-200 flex-1" title={`${unansweredCount} לא ענה`} />}
        </div>
      )}
      {answeredCount > 0 && (
        <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
          <span><span className="text-green-600 font-medium">{correctCount}</span> נכון</span>
          <span><span className="text-red-500 font-medium">{incorrectCount}</span> שגוי</span>
          {unansweredCount > 0 && <span><span className="font-medium">{unansweredCount}</span> לא ענה</span>}
        </div>
      )}

      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {questions.map((q, idx) => {
            const answer = student.answers.find(a => a.questionId === q.id);
            if (!answer) return (
              <div key={q.id} className="flex items-center gap-2 text-sm text-gray-400 py-1 border-t border-gray-100 pt-2">
                <span className="shrink-0 text-gray-300">{idx + 1}.</span>
                <span className="font-medium text-gray-400">{q.title}</span>
                <span className="me-auto text-xs">לא ענה</span>
              </div>
            );
            const isCorrect = answer.selectedOptionIndex === q.correctAnswerIndex;
            return (
              <div key={q.id} className={`rounded-lg px-3 py-2 text-sm border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-400 shrink-0 text-xs">{idx + 1}.</span>
                    <span className="font-semibold text-gray-800 text-xs">{q.title}</span>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">ביטחון {answer.confidenceLevel}/5</span>
                </div>
                <div className="mt-1.5 flex items-start gap-1.5 text-xs">
                  <span className={`shrink-0 font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <span className={`${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {OPTION_LABELS[answer.selectedOptionIndex]}. {q.options[answer.selectedOptionIndex]}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="mt-1 flex items-start gap-1.5 text-xs text-green-700">
                    <span className="shrink-0">→</span>
                    <span>{OPTION_LABELS[q.correctAnswerIndex]}. {q.options[q.correctAnswerIndex]}</span>
                  </div>
                )}
                {answer.explanation && (
                  <p className="mt-1.5 text-gray-500 text-xs border-t border-gray-200 pt-1">{answer.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentAggregations({ students, questions }) {
  const studentsWithAnswers = students.filter(s => s.answers.length > 0);
  if (studentsWithAnswers.length === 0) return null;

  const scoreGroups = { low: 0, mid: 0, high: 0 };
  studentsWithAnswers.forEach(s => {
    const correct = s.answers.filter(a => {
      const q = questions.find(q => q.id === a.questionId);
      return q && a.selectedOptionIndex === q.correctAnswerIndex;
    }).length;
    const pct = (correct / questions.length) * 100;
    if (pct < 50) scoreGroups.low++;
    else if (pct < 80) scoreGroups.mid++;
    else scoreGroups.high++;
  });

  const confGroups = { low: 0, mid: 0, high: 0 };
  studentsWithAnswers.forEach(s => {
    const avg = s.answers.reduce((sum, a) => sum + a.confidenceLevel, 0) / s.answers.length;
    if (avg < 2.5) confGroups.low++;
    else if (avg < 3.75) confGroups.mid++;
    else confGroups.high++;
  });

  const flagged = studentsWithAnswers.filter(s => {
    const avgConf = s.answers.reduce((sum, a) => sum + a.confidenceLevel, 0) / s.answers.length;
    const correctCount = s.answers.filter(a => {
      const q = questions.find(q => q.id === a.questionId);
      return q && a.selectedOptionIndex === q.correctAnswerIndex;
    }).length;
    return avgConf >= 4 && (correctCount / s.answers.length) < 0.5;
  });

  const total = studentsWithAnswers.length;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
      <h3 className="font-bold text-gray-700 text-sm mb-3">סיכום כיתה</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">התפלגות ציונים</p>
          <div className="flex flex-col gap-1 text-xs">
            {[
              { label: '80–100%', count: scoreGroups.high, color: 'bg-green-400' },
              { label: '50–79%',  count: scoreGroups.mid,  color: 'bg-yellow-400' },
              { label: '0–49%',   count: scoreGroups.low,  color: 'bg-red-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-14 text-gray-500 shrink-0">{label}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full`} style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }} />
                </div>
                <span className="w-5 text-gray-600 font-medium text-left">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">התפלגות ביטחון</p>
          <div className="flex flex-col gap-1 text-xs">
            {[
              { label: 'גבוה (4–5)', count: confGroups.high, color: 'bg-indigo-400' },
              { label: 'בינוני (2.5–4)', count: confGroups.mid, color: 'bg-blue-300' },
              { label: 'נמוך (1–2.5)', count: confGroups.low, color: 'bg-gray-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-20 text-gray-500 shrink-0">{label}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full`} style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }} />
                </div>
                <span className="w-5 text-gray-600 font-medium text-left">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {flagged.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-orange-700">
            ביטחון גבוה, ביצועים נמוכים ({flagged.length} תלמידים):
          </p>
          <p className="text-xs text-orange-600 mt-0.5">{flagged.map(s => s.name).join('، ')}</p>
        </div>
      )}
    </div>
  );
}

function QuestionsAttentionSummary({ questions, students }) {
  const flagged = questions.map((q, idx) => {
    const answers = students.flatMap(s => s.answers.filter(a => a.questionId === q.id));
    if (answers.length === 0) return null;
    const correct = answers.filter(a => a.selectedOptionIndex === q.correctAnswerIndex).length;
    const accuracy = correct / answers.length;
    const avgConf = answers.reduce((s, a) => s + a.confidenceLevel, 0) / answers.length;
    const dominantWrongIdx = [0, 1, 2, 3].find(i => i !== q.correctAnswerIndex && answers.filter(a => a.selectedOptionIndex === i).length / answers.length > 0.4) ?? null;

    const issues = [
      avgConf >= 4 && accuracy < 0.5 && 'אמון גבוה, ביצועים נמוכים',
      avgConf < 4 && accuracy < 0.5 && 'דיוק נמוך',
      dominantWrongIdx !== null && `טעות נפוצה בתשובה ${['א','ב','ג','ד'][dominantWrongIdx]}`,
    ].filter(Boolean);

    if (issues.length === 0) return null;
    return { idx, title: q.title, issues, accuracy: Math.round(accuracy * 100) };
  }).filter(Boolean);

  if (flagged.length === 0) return (
    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium text-center">
      כל השאלות עברו ללא בעיות בולטות
    </div>
  );

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <p className="font-bold text-amber-800 text-sm mb-2">שאלות הדורשות תשומת לב ({flagged.length})</p>
      <div className="flex flex-col gap-2">
        {flagged.map(({ idx, title, issues, accuracy }) => (
          <div key={idx} className="flex items-start gap-3 bg-white rounded-lg px-3 py-2 border border-amber-100">
            <span className="shrink-0 font-bold text-amber-700 text-sm w-6">{idx + 1}.</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{issues.join(' · ')}</p>
            </div>
            <span className="shrink-0 text-sm font-bold text-red-600">{accuracy}%</span>
          </div>
        ))}
      </div>
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
              <QuestionsAttentionSummary questions={questions} students={students} />
              {questions.map((q, idx) => (
                <QuestionStatCard key={q.id} question={q} students={students} index={idx} />
              ))}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="flex flex-col gap-3">
              <StudentAggregations students={students} questions={questions} />
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
