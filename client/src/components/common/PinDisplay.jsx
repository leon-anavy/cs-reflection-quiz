import { useState } from 'react';

export default function PinDisplay({ pin }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(pin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-flex items-center gap-1 bg-white border-4 border-blue-500 rounded-2xl px-6 py-4">
        <span className="text-gray-500 text-sm font-medium me-2">קוד:</span>
        {pin.split('').map((char, i) => (
          <span
            key={i}
            dir="ltr"
            className="text-4xl font-mono font-black tracking-widest text-blue-700 w-10 text-center"
          >
            {char}
          </span>
        ))}
      </div>
      <button
        onClick={handleCopy}
        className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition-colors font-medium"
      >
        {copied ? '✓ הקוד הועתק' : 'העתק קוד'}
      </button>
    </div>
  );
}
