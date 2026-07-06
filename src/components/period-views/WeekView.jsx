// 주간 뷰: 최근 7일 완료 개수 막대그래프
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function WeekView({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis dataKey="label" />
        <YAxis domain={[0, 8]} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="completedCount" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
