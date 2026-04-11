export default function StudentRow({ student, totalQuestions }) {
  const { name, currentQuestionIndex, finished, answers } = student;

  let statusText, statusClass;
  if (finished || currentQuestionIndex >= totalQuestions) {
    statusText = 'סיים ✓';
    statusClass = 'bg-green-100 text-green-800';
  } else if (answers.length === 0) {
    statusText = 'ממתין...';
    statusClass = 'bg-gray-100 text-gray-600';
  } else {
    statusText = `שאלה ${currentQuestionIndex + 1} מתוך ${totalQuestions}`;
    statusClass = 'bg-blue-100 text-blue-800';
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border
      ${finished || currentQuestionIndex >= totalQuestions ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <span className="font-medium text-gray-800">{name}</span>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}>{statusText}</span>
    </div>
  );
}
