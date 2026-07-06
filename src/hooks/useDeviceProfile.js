// 기기별 고정 프로필(아버지/어머니) 선택 상태를 localStorage + Anonymous Auth와 동기화하는 훅
import { useEffect, useState, useCallback } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { registerDeviceForProfile } from "../lib/profiles";

const STORAGE_KEY = "chair-exercise-device-profile";

export function useDeviceProfile() {
  const [profileId, setProfileIdState] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [uid, setUid] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        const cred = await signInAnonymously(auth);
        setUid(cred.user.uid);
      }
      setReady(true);
    });
    return unsub;
  }, []);

  const setProfileId = useCallback(
    async (id) => {
      localStorage.setItem(STORAGE_KEY, id);
      setProfileIdState(id);
      if (uid) {
        await registerDeviceForProfile(id, uid);
      }
    },
    [uid]
  );

  const clearProfileId = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfileIdState(null);
  }, []);

  useEffect(() => {
    if (ready && uid && profileId) {
      registerDeviceForProfile(profileId, uid);
    }
  }, [ready, uid, profileId]);

  return { profileId, setProfileId, clearProfileId, uid, ready };
}
