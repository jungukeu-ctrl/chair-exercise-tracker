// 최근 메모 모아보기 (건강 이상 신호 파악용)
import { EXERCISES } from "../constants/exercises";

export default function MemoList({ records }) {
  const memos = [];
  for (const [date, day] of Object.entries(records).sort((a, b) => (a[0] < b[0] ? 1 : -1))) {
    for (const [exId, entry] of Object.entries(day.exercises || {})) {
      if (entry.memo) {
        const exercise = EXERCISES.find((e) => e.id === exId);
        memos.push({ date, exerciseName: exercise?.name, memo: entry.memo });
      }
    }
  }

  if (memos.length === 0) return <p className="memo-list-empty">메모가 없습니다.</p>;

  return (
    <ul className="memo-list">
      {memos.map((m, i) => (
        <li key={i}>
          <span className="memo-date">{m.date}</span>
          <span className="memo-exercise">{m.exerciseName}</span>
          <span className="memo-text">{m.memo}</span>
        </li>
      ))}
    </ul>
  );
}
