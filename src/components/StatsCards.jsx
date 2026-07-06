// 대시보드 통계 카드 (현재/최장 연속일수, 총 참여일, 총 완주일, 평균 완료율)
export default function StatsCards({ stats }) {
  const items = [
    { label: "현재 연속일수", value: `${stats.currentStreak}일` },
    { label: "최장 연속일수", value: `${stats.longestStreak}일` },
    { label: "총 참여일수", value: `${stats.totalParticipationDays}일` },
    { label: "총 완주일수", value: `${stats.totalCompleteDays}일` },
    { label: "평균 완료율", value: `${Math.round(stats.averageCompletionRate * 100)}%` },
  ];
  return (
    <div className="stats-cards">
      {items.map((item) => (
        <div className="stats-card" key={item.label}>
          <div className="stats-value">{item.value}</div>
          <div className="stats-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
