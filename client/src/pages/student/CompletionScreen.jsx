const OPTION_LABELS = ['א', 'ב', 'ג', 'ד'];

export default function CompletionScreen({ session, answers }) {
  const questions = session?.questions || [];
  const answersMap = answers || {};

  const correct = questions.filter(q => answersMap[q.id]?.selectedOptionIndex === q.correctAnswerIndex).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex flex-col items-center justify-start pt-10">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center mb-4">
        <div className="text-5xl mb-3">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">תודה רבה!</h1>
        <p className="text-gray-500 text-sm mb-5">סיימת את המבדק בהצלחה</p>

        {total > 0 && (
          <>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-2xl mb-1
              ${pct >= 70 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {correct}/{total}
              <span className="text-lg font-bold">({pct}%)</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">תשובות נכונות</p>
          </>
        )}
      </div>

      {questions.length > 0 && (
        <div className="max-w-lg w-full flex flex-col gap-2 pb-10">
          {questions.map((q, idx) => {
            const answer = answersMap[q.id];
            const isCorrect = answer?.selectedOptionIndex === q.correctAnswerIndex;
            const notAnswered = !answer;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border px-4 py-3 text-sm
                  ${notAnswered ? 'border-gray-200' : isCorrect ? 'border-green-200' : 'border-red-200'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 text-xs shrink-0">{idx + 1}.</span>
                  <span className="font-semibold text-gray-800 text-xs">{q.title}</span>
                  <span className="me-auto" />
                  {notAnswered
                    ? <span className="text-gray-400 text-xs">לא נענה</span>
                    : <span className={`font-bold text-xs ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                        {isCorrect ? '✓ נכון' : '✗ שגוי'}
                      </span>
                  }
                </div>
                {answer && (
                  <div className={`text-xs mt-1 ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                    {OPTION_LABELS[answer.selectedOptionIndex]}. {q.options[answer.selectedOptionIndex]}
                  </div>
                )}
                {answer && !isCorrect && (
                  <div className="text-xs mt-1 text-green-700">
                    → {OPTION_LABELS[q.correctAnswerIndex]}. {q.options[q.correctAnswerIndex]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
