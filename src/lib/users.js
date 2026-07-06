// users/{uid} 문서 조회 (role, allowedProfiles) — 대시보드 접근 권한 판단용
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserAccess(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}
