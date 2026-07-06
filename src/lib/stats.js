// 스트릭/참여일/완주일 등 통계 계산 유틸 (records map: { "YYYY-MM-DD": { completedCount } })
import { EXERCISES } from "../constants/exercises";

const TOTAL_EXERCISES = EXERCISES.length;

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// today부터 과거로 거슬러가며 8/8 완주가 끊기지 않은 연속일수
export function calcCurrentStreak(records, today = new Date()) {
  let streak = 0;
  const cursor = new Date(today);
  while (true) {
    const key = toDateStr(cursor);
    const day = records[key];
    if (day && day.completedCount === TOTAL_EXERCISES) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calcLongestStreak(records) {
  const dates = Object.keys(records).sort();
  let longest = 0;
  let current = 0;
  let prevDate = null;
  for (const key of dates) {
    if (records[key].completedCount !== TOTAL_EXERCISES) {
      current = 0;
      prevDate = null;
      continue;
    }
    const d = new Date(key);
    if (prevDate) {
      const diffDays = Math.round((d - prevDate) / 86400000);
      current = diffDays === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prevDate = d;
  }
  return longest;
}

export function calcTotalParticipationDays(records) {
  return Object.values(records).filter((d) => d.completedCount > 0).length;
}

export function calcTotalCompleteDays(records) {
  return Object.values(records).filter((d) => d.completedCount === TOTAL_EXERCISES).length;
}

export function calcAverageCompletionRate(records) {
  const values = Object.values(records);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, d) => acc + d.completedCount / TOTAL_EXERCISES, 0);
  return sum / values.length;
}
