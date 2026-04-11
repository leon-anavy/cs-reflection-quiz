const LABELS = {
  1: 'ניחשתי',
  2: 'לא בטוח',
  3: 'סביר',
  4: 'בטוח',
  5: 'בטוח ב-100%'
};

export default function ConfidenceSlider({ value, onChange }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">רמת ביטחון</p>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map(level => (
          <button
            key={level}
            type="button"
            aria-pressed={value === level}
            onClick={() => onChange(level)}
            className={`flex-1 min-w-[3rem] min-h-[3rem] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all
              ${value === level
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
          >
            <span className="font-bold text-lg">{level}</span>
            <span className="text-xs text-center leading-tight px-1">{LABELS[level]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
