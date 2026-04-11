import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const OPTION_LABELS = ['א', 'ב', 'ג', 'ד'];

export default function AnswerDistributionChart({ distribution, correctIndex }) {
  const data = distribution.map((count, idx) => ({
    name: OPTION_LABELS[idx],
    count,
    correct: idx === correctIndex
  }));

  return (
    <div dir="ltr" className="w-full h-36">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" name="תלמידים">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.correct ? '#22c55e' : '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
