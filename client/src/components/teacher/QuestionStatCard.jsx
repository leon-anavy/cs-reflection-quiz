import AccuracyPieChart from './AccuracyPieChart';
import AnswerDistributionChart from './AnswerDistributionChart';
import ExplanationsFeed from './ExplanationsFeed';

export default function QuestionStatCard({ question, students, index }) {
  const answers = students.flatMap(s =>
    s.answers.filter(a => a.questionId === question.id)
  );

  const totalAnswered = answers.length;
  const correctCount = answers.filter(a => a.selectedOptionIndex === question.correctAnswerIndex).length;
  const incorrectCount = totalAnswered - correctCount;
  const accuracy = totalAnswered > 0 ? correctCount / totalAnswered : 0;
  const avgConfidence = totalAnswered > 0
    ? answers.reduce((sum, a) => sum + a.confidenceLevel, 0) / totalAnswered
    : 0;

  const distribution = [0, 1, 2, 3].map(i =>
    answers.filter(a => a.selectedOptionIndex === i).length
  );

  const isHighConfLowAcc = avgConfidence >= 4 && accuracy < 0.5 && totalAnswered > 0;
  const isLowAccuracy = accuracy < 0.5 && totalAnswered > 0;
  // Dominant wrong answer: a single wrong option captured > 40% of votes
  const dominantWrongIdx = totalAnswered > 0
    ? [0, 1, 2, 3].find(i => i !== question.correctAnswerIndex && distribution[i] / totalAnswered > 0.4)
    : null;

  const flags = [
    isHighConfLowAcc && { label: 'אמון גבוה, ביצועים נמוכים', color: 'bg-red-100 text-red-700 border-red-300' },
    !isHighConfLowAcc && isLowAccuracy && { label: 'דיוק נמוך', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    dominantWrongIdx !== null && { label: `טעות נפוצה: תשובה ${['א','ב','ג','ד'][dominantWrongIdx]}`, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  ].filter(Boolean);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${flags.length > 0 ? 'border-orange-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-xs text-gray-400 font-medium">שאלה {index + 1}</span>
          <h3 className="font-bold text-gray-900">{question.title}</h3>
        </div>
        {flags.length > 0 && (
          <div className="flex flex-col gap-1 items-end shrink-0">
            {flags.map(f => (
              <span key={f.label} className={`text-xs font-bold px-3 py-1 rounded-full border ${f.color}`}>
                ⚠ {f.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">{question.questionText}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">דיוק</p>
          <p className="text-2xl font-black text-gray-900">{totalAnswered > 0 ? Math.round(accuracy * 100) : '—'}%</p>
          <p className="text-xs text-gray-400">{correctCount}/{totalAnswered} נכון</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">ביטחון ממוצע</p>
          <p className="text-2xl font-black text-gray-900">{avgConfidence > 0 ? avgConfidence.toFixed(1) : '—'}</p>
          <p className="text-xs text-gray-400">מתוך 5</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1 text-center">דיוק</p>
          <AccuracyPieChart correct={correctCount} incorrect={incorrectCount} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1 text-center">התפלגות תשובות</p>
          <AnswerDistributionChart distribution={distribution} correctIndex={question.correctAnswerIndex} />
        </div>
      </div>

      <ExplanationsFeed
        students={students}
        questionId={question.id}
        questionCorrectIndex={question.correctAnswerIndex}
      />
    </div>
  );
}
