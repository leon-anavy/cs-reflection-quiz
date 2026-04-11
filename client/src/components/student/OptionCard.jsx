const LABELS = ['א', 'ב', 'ג', 'ד'];

export default function OptionCard({ index, text, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-pressed={isSelected}
      className={`w-full min-h-[3rem] flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-right transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-300'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
        }`}
    >
      <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
        ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
        {LABELS[index]}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  );
}
