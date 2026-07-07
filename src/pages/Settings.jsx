// 알림 시간 설정 화면 (프로필별 알림 시간 변경 + FCM 토큰 등록)
import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { useDeviceProfile } from "../hooks/useDeviceProfile";
import { getProfile, setNotificationTime, addFcmToken } from "../lib/profiles";
import { getMessagingIfSupported } from "../firebase";
import { PROFILES } from "../constants/exercises";

const DEFAULT_TIME = "20:00";

export default function Settings() {
  const { profileId, ready } = useDeviceProfile();
  const [time, setTime] = useState(DEFAULT_TIME);
  const [notifStatus, setNotifStatus] = useState("idle");

  useEffect(() => {
    if (!profileId) return;
    getProfile(profileId).then((p) => {
      if (p?.notificationTime) setTime(p.notificationTime);
    });
  }, [profileId]);

  async function handleTimeChange(newTime) {
    setTime(newTime);
    if (profileId) await setNotificationTime(profileId, newTime);
  }

  async function handleEnableNotifications() {
    setNotifStatus("requesting");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotifStatus("denied");
        return;
      }
      const messaging = await getMessagingIfSupported();
      if (!messaging) {
        setNotifStatus("unsupported");
        return;
      }
      const swParams = new URLSearchParams({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      });
      const swRegistration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}firebase-messaging-sw.js?${swParams.toString()}`
      );
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });
      await addFcmToken(profileId, token);
      setNotifStatus("enabled");
    } catch (err) {
      setNotifStatus("error");
    }
  }

  if (!ready) return <div className="loading">불러오는 중...</div>;
  if (!profileId) {
    return <p>먼저 오늘의 운동 화면에서 기기 프로필을 선택해주세요.</p>;
  }

  const profileName = PROFILES.find((p) => p.id === profileId)?.name;

  return (
    <div className="settings">
      <h1>알림 설정 ({profileName})</h1>

      <p className="notif-notice">알림 발송 기능은 현재 준비 중입니다.</p>

      <label>
        매일 리마인드 시간
        <input type="time" value={time} onChange={(e) => handleTimeChange(e.target.value)} />
      </label>

      <button onClick={handleEnableNotifications}>이 기기에서 알림 받기</button>
      {notifStatus === "enabled" && <p>알림이 활성화되었습니다.</p>}
      {notifStatus === "denied" && <p>알림 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.</p>}
      {notifStatus === "unsupported" && <p>이 브라우저는 알림을 지원하지 않습니다.</p>}
      {notifStatus === "error" && <p>알림 등록 중 오류가 발생했습니다.</p>}
    </div>
  );
}
