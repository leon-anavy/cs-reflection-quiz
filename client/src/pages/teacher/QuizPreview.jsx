import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeBlock from '../../components/student/CodeBlock';

const OPTION_LABELS = ['א', 'ב', 'ג', 'ד'];

export default function QuizPreview() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/questions')
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">טוען...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/teacher')} className="text-sm text-gray-500 hover:text-gray-700">← חזרה</button>
        <h1 className="text-2xl font-black text-gray-900">תצוגה מקדימה — תשובות נכונות</h1>
      </div>

      {questions.length === 0 ? (
        <p className="text-center text-gray-400 py-10">אין שאלות בבנק</p>
      ) : (
        <div className="flex flex-col gap-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="mb-3">
                <span className="text-xs text-gray-400 font-medium">שאלה {idx + 1}</span>
                <h2 className="text-lg font-bold text-gray-900">{q.title}</h2>
                <p className="text-gray-700 mt-1">{q.questionText}</p>
                <CodeBlock code={q.codeSnippet} />
              </div>

              <div className="flex flex-col gap-2">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correctAnswerIndex;
                  const explanation = q.answerExplanations?.[i];
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border-2 px-4 py-3 ${
                        isCorrect
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {OPTION_LABELS[i]}
                        </span>
                        <span className={`font-medium ${isCorrect ? 'text-green-900' : 'text-gray-700'}`}>
                          {opt}
                        </span>
                        {isCorrect && (
                          <span className="ms-auto text-green-600 font-bold text-sm shrink-0">✓ נכון</span>
                        )}
                      </div>
                      {explanation && (
                        <p className={`mt-2 text-sm me-11 ${isCorrect ? 'text-green-800' : 'text-gray-500'}`}>
                          {explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
