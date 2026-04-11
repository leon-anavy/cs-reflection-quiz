export default function PinDisplay({ pin }) {
  return (
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
  );
}
