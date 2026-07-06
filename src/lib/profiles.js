// profiles/{profileId} 문서에 현재 기기(익명 uid)를 등록/조회하는 헬퍼
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

export async function registerDeviceForProfile(profileId, uid) {
  const ref = doc(db, "profiles", profileId);
  await setDoc(ref, { name: profileId, deviceUids: arrayUnion(uid) }, { merge: true });
}

export async function getProfile(profileId) {
  const snap = await getDoc(doc(db, "profiles", profileId));
  return snap.exists() ? snap.data() : null;
}

export async function setNotificationTime(profileId, time) {
  await setDoc(doc(db, "profiles", profileId), { notificationTime: time }, { merge: true });
}

export async function addFcmToken(profileId, token) {
  await setDoc(doc(db, "profiles", profileId), { fcmTokens: arrayUnion(token) }, { merge: true });
}

// 자녀 계정 전용: 등록된 기기를 모두 해제 (다음 접속 기기가 새로 자동 등록됨)
export async function resetDeviceUids(profileId) {
  await setDoc(doc(db, "profiles", profileId), { deviceUids: [] }, { merge: true });
}
