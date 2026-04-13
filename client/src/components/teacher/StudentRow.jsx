import { useState } from 'react';

export default function StudentRow({ student, totalQuestions, onDelete }) {
  const { name, currentQuestionIndex, finished, answers } = student;
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    setDeleting(true);
    await onDelete(student.studentId);
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border
      ${finished || currentQuestionIndex >= totalQuestions ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <span className="font-medium text-gray-800">{name}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}>{statusText}</span>
        {confirming ? (
          <>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? '...' : 'מחק'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-gray-500 hover:text-gray-700 px-1"
            >
              ביטול
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-gray-300 hover:text-red-400 text-sm leading-none px-1"
            title="הסר תלמיד"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
