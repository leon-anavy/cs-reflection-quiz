export default function CompletionScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">תודה רבה!</h1>
        <p className="text-gray-600 mb-2">סיימת את המבדק בהצלחה.</p>
        <p className="text-gray-500 text-sm">
          כעת הסתכל על הלוח / מסך המורה לתוצאות.
        </p>
      </div>
    </div>
  );
}
