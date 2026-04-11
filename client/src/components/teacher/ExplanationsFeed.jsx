import { useState } from 'react';

export default function ExplanationsFeed({ students, questionId, questionCorrectIndex }) {
  const [expanded, setExpanded] = useState(false);

  const entries = students
    .filter(s => s.answers.some(a => a.questionId === questionId))
    .map(s => {
      const answer = s.answers.find(a => a.questionId === questionId);
      return {
        name: s.name,
        explanation: answer.explanation,
        isCorrect: answer.selectedOptionIndex === questionCorrectIndex
      };
    });

  if (entries.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        className="text-sm text-blue-600 hover:underline mb-2"
      >
        {expanded ? '▲ הסתר הסברים' : `▼ הצג ${entries.length} הסברים`}
      </button>
      {expanded && (
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
          {entries.map((entry, i) => (
            <div key={i} className={`rounded-xl px-4 py-3 border text-sm
              ${entry.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex justify-between mb-1">
                <span className="font-semibold">{entry.name}</span>
                <span className={`text-xs font-bold ${entry.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {entry.isCorrect ? 'נכון' : 'שגוי'}
                </span>
              </div>
              <p className="text-gray-700">{entry.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
