export default function RTLLayout({ children }) {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {children}
    </div>
  );
}
