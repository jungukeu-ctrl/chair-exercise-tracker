// 대시보드 기간 탭(주/월/분기/년)에 필요한 날짜 범위 계산 유틸
function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// 최근 7일 (오늘 포함) 날짜 목록
export function lastNDays(n, base = new Date()) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    days.push({ date: toDateStr(d), label: WEEKDAY_LABELS[d.getDay()] });
  }
  return days;
}

// 특정 연/월의 시작일, 마지막일
export function monthRange(year, month) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

// base로부터 최근 n개월의 {year, month, label} 목록 (오래된 순)
export function lastNMonths(n, base = new Date()) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${d.getMonth() + 1}월` });
  }
  return months;
}

// records map({date: {completedCount}})에서 해당 연/월에 속한 날짜들의 평균 완료 개수
export function monthlyAverage(records, year, month) {
  const { start, end } = monthRange(year, month);
  const values = Object.entries(records)
    .filter(([date]) => date >= start && date <= end)
    .map(([, day]) => day.completedCount);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
