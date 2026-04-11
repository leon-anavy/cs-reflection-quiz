import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AccuracyPieChart({ correct, incorrect }) {
  const data = [
    { name: 'נכון', value: correct },
    { name: 'שגוי', value: incorrect }
  ];

  if (correct + incorrect === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">אין נתונים עדיין</p>;
  }

  return (
    <div dir="ltr" className="w-full h-40">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
            <Cell fill="#22c55e" />
            <Cell fill="#ef4444" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
