// 오늘의 운동 기록 화면 — localStorage 전용 (Firebase 없음)
import { useState } from "react";
import { EXERCISES, PROFILES } from "../constants/exercises";
import { isMobileDevice } from "../lib/device";
import ProfilePicker from "../components/ProfilePicker";
import ProgressRing from "../components/ProgressRing";
import StreakBadge from "../components/StreakBadge";
import CelebrationStamp from "../components/CelebrationStamp";
import ExerciseCard from "../components/ExerciseCard";

const PROFILE_KEY = "chair-exercise-device-profile";
const RECORDS_KEY = "chair-exercise-records";

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRecords(records) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

function getDayRecord(records, profileId, date) {
  const exercises = {};
  for (const ex of EXERCISES) {
    exercises[ex.id] = records?.[profileId]?.[date]?.[ex.id] || { done: false, memo: "" };
  }
  return exercises;
}

function calcStreak(records, profileId) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const dateStr = toDateStr(d);
    const dayData = records?.[profileId]?.[dateStr];
    const count = dayData ? Object.values(dayData).filter((e) => e.done).length : 0;
    if (count === EXERCISES.length) {
      streak++;
    } else if (i > 0) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function TodayExercise() {
  const [profileId, setProfileId] = useState(() => localStorage.getItem(PROFILE_KEY));
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [records, setRecords] = useState(loadRecords);
  const [showCelebration, setShowCelebration] = useState(false);
  const isMobile = isMobileDevice();

  const isToday = selectedDate === toDateStr(new Date());
  const dayRecord = getDayRecord(records, profileId, selectedDate);
  const completedCount = Object.values(dayRecord).filter((e) => e.done).length;
  const streak = profileId ? calcStreak(records, profileId) : 0;

  function selectProfile(id) {
    localStorage.setItem(PROFILE_KEY, id);
    setProfileId(id);
  }

  function clearProfile() {
    localStorage.removeItem(PROFILE_KEY);
    setProfileId(null);
  }

  function updateExercise(exerciseId, patch) {
    const updated = loadRecords();
    if (!updated[profileId]) updated[profileId] = {};
    if (!updated[profileId][selectedDate]) updated[profileId][selectedDate] = {};
    updated[profileId][selectedDate][exerciseId] = {
      ...updated[profileId][selectedDate][exerciseId],
      ...patch,
    };
    saveRecords(updated);
    setRecords({ ...updated });

    const newCount = Object.values(updated[profileId][selectedDate]).filter((e) => e.done).length;
    if (patch.done && newCount === EXERCISES.length) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }
  }

  if (!profileId) {
    return <ProfilePicker onSelect={selectProfile} />;
  }

  const profileName = PROFILES.find((p) => p.id === profileId)?.name;

  return (
    <div className="today-exercise">
      <header>
        <div>
          <h1>오늘의 운동</h1>
          <p>{profileName}님</p>
        </div>
        <button className="change-profile" onClick={clearProfile}>
          프로필 변경
        </button>
      </header>

      {!isMobile && <div className="device-notice">이 화면은 폰에서 이용해주세요.</div>}

      <div className="date-nav">
        <input
          type="date"
          value={selectedDate}
          max={toDateStr(new Date())}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        {!isToday && <span className="past-date-notice">과거 날짜 수정 중</span>}
      </div>

      <div className="summary">
        <ProgressRing completed={completedCount} total={EXERCISES.length} />
        <StreakBadge streak={streak} />
      </div>

      <div className="exercise-list">
        {EXERCISES.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            done={dayRecord[ex.id].done}
            memo={dayRecord[ex.id].memo}
            disabled={!isMobile}
            onToggle={(done) => updateExercise(ex.id, { done })}
            onMemoChange={(memo) => updateExercise(ex.id, { memo })}
          />
        ))}
      </div>

      <CelebrationStamp show={showCelebration} />
    </div>
  );
}
