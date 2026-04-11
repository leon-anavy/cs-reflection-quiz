function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function sessionToCSV(session) {
  const headers = [
    'studentName',
    'questionId',
    'questionTitle',
    'selectedOptionIndex',
    'selectedOptionText',
    'correctAnswerIndex',
    'isCorrect',
    'confidenceLevel',
    'explanation'
  ];

  const rows = [headers.join(',')];

  const questionMap = {};
  for (const q of session.questions) {
    questionMap[q.id] = q;
  }

  for (const student of session.students) {
    for (const answer of student.answers) {
      const q = questionMap[answer.questionId];
      const isCorrect = q ? answer.selectedOptionIndex === q.correctAnswerIndex : '';
      const selectedText = q ? q.options[answer.selectedOptionIndex] : '';

      rows.push([
        escapeCSV(student.name),
        escapeCSV(answer.questionId),
        escapeCSV(q ? q.title : ''),
        escapeCSV(answer.selectedOptionIndex),
        escapeCSV(selectedText),
        escapeCSV(q ? q.correctAnswerIndex : ''),
        escapeCSV(isCorrect),
        escapeCSV(answer.confidenceLevel),
        escapeCSV(answer.explanation)
      ].join(','));
    }
  }

  return rows.join('\n');
}

module.exports = { sessionToCSV };
