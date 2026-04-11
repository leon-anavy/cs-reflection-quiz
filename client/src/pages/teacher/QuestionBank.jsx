import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const EMPTY_QUESTION = {
  id: '',
  title: '',
  codeSnippet: '',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswerIndex: 0
};

function QuestionForm({ question, onSave, onCancel }) {
  const [form, setForm] = useState(question);

  function setOption(idx, value) {
    const options = [...form.options];
    options[idx] = value;
    setForm(f => ({ ...f, options }));
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-3">
      <input
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        placeholder="כותרת"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
      />
      <input
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        placeholder="טקסט השאלה"
        value={form.questionText}
        onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
      />
      <textarea
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
        placeholder="קטע קוד Java (אופציונלי)"
        rows={4}
        dir="ltr"
        value={form.codeSnippet}
        onChange={e => setForm(f => ({ ...f, codeSnippet: e.target.value }))}
      />
      <div className="flex flex-col gap-2">
        {form.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={form.correctAnswerIndex === idx}
              onChange={() => setForm(f => ({ ...f, correctAnswerIndex: idx }))}
            />
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              placeholder={`אפשרות ${idx + 1}`}
              value={opt}
              onChange={e => setOption(idx, e.target.value)}
            />
          </div>
        ))}
        <p className="text-xs text-gray-400">בחר את התשובה הנכונה על ידי סימון הכפתור המעגלי</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="flex-1 bg-blue-600 text-white font-semibold rounded-lg py-2 text-sm hover:bg-blue-700"
        >
          שמור
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">ביטול</button>
      </div>
    </div>
  );
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/questions').then(r => r.json()).then(setQuestions).catch(() => {});
  }, []);

  async function handleSaveEdit(updated) {
    await fetch(`/api/questions/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    setQuestions(qs => qs.map(q => q.id === updated.id ? updated : q));
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (!confirm('למחוק את השאלה?')) return;
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    setQuestions(qs => qs.filter(q => q.id !== id));
  }

  async function handleDeleteAll() {
    if (!confirm('למחוק את כל השאלות מהבנק? פעולה זו אינה הפיכה.')) return;
    await fetch('/api/questions', { method: 'DELETE' });
    setQuestions([]);
  }

  async function handleAdd(newQ) {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQ)
    });
    const added = await res.json();
    setQuestions(qs => [...qs, ...added]);
    setAdding(false);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(arr)
        });
        const added = await res.json();
        setQuestions(qs => [...qs, ...added]);
      } catch {
        setImportError('שגיאה בקריאת הקובץ. ודא שמדובר ב-JSON תקין.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function downloadTemplate() {
    const template = [EMPTY_QUESTION];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/teacher')} className="text-sm text-gray-500 hover:text-gray-700">← חזרה</button>
        <h1 className="text-2xl font-black text-gray-900">בנק שאלות</h1>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-5">
        ⚠️ שינויים ישפיעו <strong>רק על מבדקים עתידיים</strong>. מבדקים קיימים לא יושפעו.
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-blue-700"
        >
          + הוסף שאלה
        </button>
        <button
          onClick={() => fileRef.current.click()}
          className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-xl text-sm hover:bg-gray-200"
        >
          ייבא JSON
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <button
          onClick={downloadTemplate}
          className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-xl text-sm hover:bg-gray-200"
        >
          הורד תבנית
        </button>
        {questions.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="bg-red-50 text-red-600 font-medium px-4 py-2 rounded-xl text-sm hover:bg-red-100 border border-red-200"
          >
            מחק הכל
          </button>
        )}
      </div>

      {importError && <p className="text-red-600 text-sm mb-3">{importError}</p>}

      {adding && (
        <div className="mb-4">
          <QuestionForm question={{ ...EMPTY_QUESTION }} onSave={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {questions.map((q, idx) => (
          <div key={q.id}>
            {editingId === q.id ? (
              <QuestionForm question={q} onSave={handleSaveEdit} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-xs text-gray-400">שאלה {idx + 1}</span>
                    <h3 className="font-bold text-gray-900">{q.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{q.questionText}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setEditingId(q.id); setAdding(false); }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      מחיקה
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
