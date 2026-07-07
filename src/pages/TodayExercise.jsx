// 오늘의 운동 기록 화면 (부모님용, 로그인 없음)
import { useEffect, useState, useCallback } from "react";
import { useDeviceProfile } from "../hooks/useDeviceProfile";
import { isMobileDevice } from "../lib/device";
import { EXERCISES, PROFILES } from "../constants/exercises";
import { getDayRecord, setExerciseDone, setExerciseMemo, getRecordsInRange } from "../lib/records";
import { calcCurrentStreak } from "../lib/stats";
import ProfilePicker from "../components/ProfilePicker";
import ExerciseCard from "../components/ExerciseCard";
import ProgressRing from "../components/ProgressRing";
import StreakBadge from "../components/StreakBadge";
import CelebrationStamp from "../components/CelebrationStamp";

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

const STREAK_LOOKBACK_DAYS = 60;

export default function TodayExercise() {
  const { profileId, setProfileId, clearProfileId, ready } = useDeviceProfile();
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [dayRecord, setDayRecord] = useState(null);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const isMobile = isMobileDevice();

  const isToday = selectedDate === toDateStr(new Date());

  const loadDay = useCallback(async () => {
    if (!profileId) return null;
    const record = await getDayRecord(profileId, selectedDate);
    setDayRecord(record);
    return record;
  }, [profileId, selectedDate]);

  const loadStreak = useCallback(async () => {
    if (!profileId) return;
    const start = new Date();
    start.setDate(start.getDate() - STREAK_LOOKBACK_DAYS);
    const records = await getRecordsInRange(profileId, toDateStr(start), toDateStr(new Date()));
    setStreak(calcCurrentStreak(records));
  }, [profileId]);

  useEffect(() => {
    if (!ready) return;
    setLoadError(null);
    loadDay().catch((err) => setLoadError(err.message));
  }, [ready, loadDay]);

  useEffect(() => {
    if (!ready) return;
    loadStreak().catch((err) => setLoadError(err.message));
  }, [ready, loadStreak]);

  async function handleToggle(exerciseId, done) {
    await setExerciseDone(profileId, selectedDate, exerciseId, done);
    const updated = await loadDay();
    if (isToday) await loadStreak();
    if (updated.completedCount === EXERCISES.length) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }
  }

  async function handleMemoChange(exerciseId, memo) {
    await setExerciseMemo(profileId, selectedDate, exerciseId, memo);
    await loadDay();
  }

  if (!ready) return <div className="loading">불러오는 중...</div>;
  if (!profileId) return <ProfilePicker onSelect={setProfileId} />;
  if (loadError) return <div className="loading">기록을 불러오지 못했습니다. ({loadError})</div>;
  if (!dayRecord) return <div className="loading">불러오는 중...</div>;

  const profileName = PROFILES.find((p) => p.id === profileId)?.name;

  return (
    <div className="today-exercise">
      <header>
        <div>
          <h1>오늘의 운동</h1>
          <p>{profileName}님</p>
        </div>
        <button className="change-profile" onClick={clearProfileId}>
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
        <ProgressRing completed={dayRecord.completedCount} total={EXERCISES.length} />
        <StreakBadge streak={streak} />
      </div>

      <div className="exercise-list">
        {EXERCISES.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            done={dayRecord.exercises[ex.id]?.done || false}
            memo={dayRecord.exercises[ex.id]?.memo}
            disabled={!isMobile}
            onToggle={(done) => handleToggle(ex.id, done)}
            onMemoChange={(memo) => handleMemoChange(ex.id, memo)}
          />
        ))}
      </div>

      <CelebrationStamp show={showCelebration} />
    </div>
  );
}
