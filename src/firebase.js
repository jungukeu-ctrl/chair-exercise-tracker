// Firebase 앱 초기화 및 Auth/Firestore/Messaging 인스턴스 export
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 오프라인 상태에서 체크한 기록도 재연결 시 자동 동기화되도록 기본 퍼시스턴스만 사용
enableIndexedDbPersistence(db).catch(() => {
  // 탭이 여러 개 열려 있거나 브라우저 미지원 시 무시 (온라인 상태에서는 정상 동작)
});

export async function getMessagingIfSupported() {
  if (await isMessagingSupported()) {
    return getMessaging(app);
  }
  return null;
}
