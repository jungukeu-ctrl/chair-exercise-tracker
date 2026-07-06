// 연속 완주일수(스트릭)를 보여주는 배지
export default function StreakBadge({ streak }) {
  if (streak <= 0) return null;
  return (
    <div className="streak-badge">
      🔥 {streak}일 연속 완주
    </div>
  );
}
