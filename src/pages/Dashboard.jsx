// 기록 보기 대시보드 (구글 로그인 필요, 부모님/자녀 열람)
import { useEffect, useMemo, useState, useCallback } from "react";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { PROFILES } from "../constants/exercises";
import { getDayRecord, getRecordsInRange } from "../lib/records";
import {
  calcCurrentStreak,
  calcLongestStreak,
  calcTotalParticipationDays,
  calcTotalCompleteDays,
  calcAverageCompletionRate,
} from "../lib/stats";
import { lastNDays, lastNMonths, monthlyAverage } from "../lib/dateRanges";
import StatsCards from "../components/StatsCards";
import MemoList from "../components/MemoList";
import ProfileManagement from "../components/ProfileManagement";
import DayView from "../components/period-views/DayView";
import WeekView from "../components/period-views/WeekView";
import MonthHeatmap from "../components/period-views/MonthHeatmap";
import PeriodBarChart from "../components/period-views/PeriodBarChart";

const TABS = ["일", "주", "월", "분기", "년"];
const STATS_LOOKBACK_DAYS = 400; // 전체 기간 통계용 조회 범위 (약 13개월)

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { user, access, ready, login, logout } = useGoogleAuth();
  const [profileId, setProfileId] = useState(null);
  const [tab, setTab] = useState("일");
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [dayRecord, setDayRecord] = useState(null);
  const [allRecords, setAllRecords] = useState({});

  const allowedProfiles = useMemo(() => {
    if (!access) return [];
    return PROFILES.filter((p) => access.allowedProfiles?.includes(p.id));
  }, [access]);

  useEffect(() => {
    if (allowedProfiles.length > 0 && !profileId) {
      setProfileId(allowedProfiles[0].id);
    }
  }, [allowedProfiles, profileId]);

  const loadAllRecords = useCallback(async () => {
    if (!profileId) return;
    const start = new Date();
    start.setDate(start.getDate() - STATS_LOOKBACK_DAYS);
    const records = await getRecordsInRange(profileId, toDateStr(start), toDateStr(new Date()));
    setAllRecords(records);
  }, [profileId]);

  useEffect(() => {
    loadAllRecords();
  }, [loadAllRecords]);

  useEffect(() => {
    if (!profileId || tab !== "일") return;
    getDayRecord(profileId, selectedDate).then(setDayRecord);
  }, [profileId, tab, selectedDate]);

  const handleRecordsDeleted = useCallback(
    (deletedProfileId) => {
      if (deletedProfileId !== profileId) return;
      loadAllRecords();
      if (tab === "일") {
        getDayRecord(profileId, selectedDate).then(setDayRecord);
      }
    },
    [profileId, tab, selectedDate, loadAllRecords]
  );

  if (!ready) return <div className="loading">불러오는 중...</div>;

  if (!user) {
    return (
      <div className="dashboard-login">
        <h1>기록 보기</h1>
        <p>구글 계정으로 로그인해주세요.</p>
        <button onClick={login}>Google 로그인</button>
      </div>
    );
  }

  if (!access || allowedProfiles.length === 0) {
    return (
      <div className="dashboard-login">
        <h1>기록 보기</h1>
        <p>이 계정은 아직 열람 권한이 없습니다. 관리자에게 문의해주세요.</p>
        <button onClick={logout}>로그아웃</button>
      </div>
    );
  }

  const overallStats = {
    currentStreak: calcCurrentStreak(allRecords),
    longestStreak: calcLongestStreak(allRecords),
    totalParticipationDays: calcTotalParticipationDays(allRecords),
    totalCompleteDays: calcTotalCompleteDays(allRecords),
    averageCompletionRate: calcAverageCompletionRate(periodRecords(tab)),
  };

  function periodRecords(currentTab) {
    if (currentTab === "주") {
      const days = lastNDays(7).map((d) => d.date);
      return Object.fromEntries(Object.entries(allRecords).filter(([date]) => days.includes(date)));
    }
    if (currentTab === "월") {
      const { year, month } = selectedMonth;
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      return Object.fromEntries(
        Object.entries(allRecords).filter(([date]) => date.startsWith(prefix))
      );
    }
    if (currentTab === "분기") {
      const months = lastNMonths(3);
      return filterByMonths(allRecords, months);
    }
    if (currentTab === "년") {
      const months = lastNMonths(12);
      return filterByMonths(allRecords, months);
    }
    return allRecords;
  }

  function filterByMonths(records, months) {
    const prefixes = months.map((m) => `${m.year}-${String(m.month).padStart(2, "0")}`);
    return Object.fromEntries(
      Object.entries(records).filter(([date]) => prefixes.some((p) => date.startsWith(p)))
    );
  }

  const weekData = lastNDays(7).map((d) => ({
    label: d.label,
    completedCount: allRecords[d.date]?.completedCount || 0,
  }));

  const quarterData = lastNMonths(3).map((m) => ({
    label: m.label,
    avgCompleted: monthlyAverage(allRecords, m.year, m.month),
  }));

  const yearData = lastNMonths(12).map((m) => ({
    label: m.label,
    avgCompleted: monthlyAverage(allRecords, m.year, m.month),
  }));

  return (
    <div className="dashboard">
      <header>
        <h1>기록 보기</h1>
        <button onClick={logout}>로그아웃</button>
      </header>

      <div className="profile-switch">
        {allowedProfiles.map((p) => (
          <button
            key={p.id}
            className={p.id === profileId ? "active" : ""}
            onClick={() => setProfileId(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="period-tabs">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? "active" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <StatsCards stats={overallStats} />

      {tab === "일" && (
        <>
          <input
            type="date"
            value={selectedDate}
            max={toDateStr(new Date())}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <DayView dayRecord={dayRecord} />
        </>
      )}

      {tab === "주" && <WeekView data={weekData} />}

      {tab === "월" && (
        <>
          <div className="month-nav">
            <select
              value={selectedMonth.month}
              onChange={(e) =>
                setSelectedMonth((s) => ({ ...s, month: Number(e.target.value) }))
              }
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
          </div>
          <MonthHeatmap
            year={selectedMonth.year}
            month={selectedMonth.month}
            records={allRecords}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setTab("일");
            }}
          />
        </>
      )}

      {tab === "분기" && <PeriodBarChart data={quarterData} />}
      {tab === "년" && <PeriodBarChart data={yearData} />}

      <section className="memo-section">
        <h2>최근 메모</h2>
        <MemoList records={allRecords} />
      </section>

      {access.role === "child" && <ProfileManagement onRecordsDeleted={handleRecordsDeleted} />}
    </div>
  );
}
