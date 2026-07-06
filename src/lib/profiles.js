// profiles/{profileId} 문서에 현재 기기(익명 uid)를 등록/조회하는 헬퍼
import { doc, getDoc, setDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function registerDeviceForProfile(profileId, uid) {
  const ref = doc(db, "profiles", profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: profileId,
      deviceUids: [uid],
      createdAt: serverTimestamp(),
    });
    return;
  }
  await setDoc(ref, { deviceUids: arrayUnion(uid) }, { merge: true });
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
