import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useStudentQuiz } from '../../hooks/useStudentQuiz';
import OptionCard from '../../components/student/OptionCard';
import ConfidenceSlider from '../../components/student/ConfidenceSlider';
import CodeBlock from '../../components/student/CodeBlock';
import CompletionScreen from './CompletionScreen';

export default function QuizFlow() {
  const location = useLocation();
  const { session, studentId } = location.state || {};

  const [selectedOption, setSelectedOption] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [explanation, setExplanation] = useState('');

  const { currentIndex, finished, submitAnswer, goBack, getAnswer } = useStudentQuiz(session, studentId);

  // Pre-fill form when navigating to a question that was already answered
  useEffect(() => {
    if (!session) return;
    const question = session.questions[currentIndex];
    const existing = getAnswer(question.id);
    if (existing) {
      setSelectedOption(existing.selectedOptionIndex);
      setConfidence(existing.confidenceLevel);
      setExplanation(existing.explanation);
    } else {
      setSelectedOption(null);
      setConfidence(null);
      setExplanation('');
    }
  }, [currentIndex]);

  if (!session || !studentId) return <Navigate to="/join" replace />;
  if (finished) return <CompletionScreen />;

  const question = session.questions[currentIndex];
  const total = session.questions.length;
  const isLast = currentIndex === total - 1;
  const canProceed = selectedOption !== null && confidence !== null && explanation.trim().length > 0;

  function handleNext() {
    submitAnswer({
      questionId: question.id,
      selectedOptionIndex: selectedOption,
      confidenceLevel: confidence,
      explanation: explanation.trim()
    });
    setSelectedOption(null);
    setConfidence(null);
    setExplanation('');
  }

  function handleBack() {
    goBack();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          שאלה {currentIndex + 1} מתוך {total}
        </span>
        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{question.title}</h2>
          <p className="text-gray-700 mb-3">{question.questionText}</p>
          <CodeBlock code={question.codeSnippet} />
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2 mb-4">
          {question.options.map((opt, idx) => (
            <OptionCard
              key={idx}
              index={idx}
              text={opt}
              isSelected={selectedOption === idx}
              onSelect={setSelectedOption}
            />
          ))}
        </div>

        {/* Confidence */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <ConfidenceSlider value={confidence} onChange={setConfidence} />
        </div>

        {/* Explanation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            הסבר מדוע בחרת בתשובה זו
          </label>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder="כתוב את הסברך כאן..."
            rows={3}
            dir="rtl"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mb-6">
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-none bg-gray-100 text-gray-700 font-semibold rounded-xl px-6 py-4 hover:bg-gray-200 transition-colors text-lg"
            >
              ← חזרה
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 bg-blue-600 text-white font-semibold rounded-xl py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors text-lg"
          >
            {isLast ? 'סיום המבדק' : 'שאלה הבאה →'}
          </button>
        </div>
      </div>
    </div>
  );
}
