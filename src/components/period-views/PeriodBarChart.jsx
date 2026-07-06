// 분기/년 뷰 공용: 월별 평균 완료 개수 막대그래프
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PeriodBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="label" />
        <YAxis domain={[0, 8]} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="avgCompleted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
