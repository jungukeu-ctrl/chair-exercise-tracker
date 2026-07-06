// records/{profileId}/days/{date} 컬렉션에 대한 Firestore 읽기/쓰기 헬퍼
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { EXERCISES } from "../constants/exercises";

function dayDocRef(profileId, date) {
  return doc(db, "records", profileId, "days", date);
}

export function emptyDay() {
  const exercises = {};
  for (const ex of EXERCISES) {
    exercises[ex.id] = { done: false };
  }
  return { exercises, completedCount: 0 };
}

export async function getDayRecord(profileId, date) {
  const snap = await getDoc(dayDocRef(profileId, date));
  return snap.exists() ? snap.data() : emptyDay();
}

function countCompleted(exercises) {
  return Object.values(exercises).filter((e) => e.done).length;
}

export async function setExerciseDone(profileId, date, exerciseId, done) {
  const current = await getDayRecord(profileId, date);
  const exercises = {
    ...current.exercises,
    [exerciseId]: { ...current.exercises[exerciseId], done },
  };
  await setDoc(
    dayDocRef(profileId, date),
    { exercises, completedCount: countCompleted(exercises), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function setExerciseMemo(profileId, date, exerciseId, memo) {
  const current = await getDayRecord(profileId, date);
  const exercises = {
    ...current.exercises,
    [exerciseId]: { ...current.exercises[exerciseId], memo, memoUpdatedAt: serverTimestamp() },
  };
  await setDoc(
    dayDocRef(profileId, date),
    { exercises, completedCount: countCompleted(exercises), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// 기간 조회 (주/월/분기/년 대시보드용). start, end는 "YYYY-MM-DD" 문자열.
export async function getRecordsInRange(profileId, startDate, endDate) {
  const daysRef = collection(db, "records", profileId, "days");
  const q = query(
    daysRef,
    where("__name__", ">=", startDate),
    where("__name__", "<=", endDate),
    orderBy("__name__")
  );
  const snap = await getDocs(q);
  const result = {};
  snap.forEach((d) => {
    result[d.id] = d.data();
  });
  return result;
}
