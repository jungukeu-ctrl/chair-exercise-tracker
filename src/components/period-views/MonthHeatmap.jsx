// 월간 뷰: 달력 히트맵 (완주일 진하게, 일부 완료 흐리게, 무기록 표시)
import { EXERCISES } from "../../constants/exercises";

const TOTAL = EXERCISES.length;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function opacityFor(completedCount) {
  if (!completedCount) return 0;
  return 0.25 + 0.75 * (completedCount / TOTAL);
}

export default function MonthHeatmap({ year, month, records, onSelectDate }) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  return (
    <div className="month-heatmap">
      <div className="heatmap-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="heatmap-grid">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="heatmap-cell empty" />;
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const completedCount = records[dateStr]?.completedCount || 0;
          return (
            <button
              key={dateStr}
              className="heatmap-cell"
              style={{ backgroundColor: `rgba(34, 197, 94, ${opacityFor(completedCount)})` }}
              onClick={() => onSelectDate(dateStr)}
              title={`${dateStr}: ${completedCount}/${TOTAL}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
