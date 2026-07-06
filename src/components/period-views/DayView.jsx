// 일간 뷰: 선택한 날짜의 8개 운동 체크 상태 + 메모
import { EXERCISES } from "../../constants/exercises";

export default function DayView({ dayRecord }) {
  if (!dayRecord) return <p>기록이 없습니다.</p>;
  return (
    <ul className="day-view-list">
      {EXERCISES.map((ex) => {
        const entry = dayRecord.exercises?.[ex.id] || {};
        return (
          <li key={ex.id} className={entry.done ? "done" : ""}>
            <span className="check-icon">{entry.done ? "✅" : "⬜"}</span>
            <span className="ex-name">{ex.name}</span>
            {entry.memo && <span className="ex-memo">{entry.memo}</span>}
          </li>
        );
      })}
    </ul>
  );
}
