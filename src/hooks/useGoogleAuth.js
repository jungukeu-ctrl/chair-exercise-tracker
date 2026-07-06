// 대시보드용 Google 로그인 + users/{uid} 권한(allowedProfiles) 조회 훅
import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getUserAccess } from "../lib/users";

export function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      // Anonymous Auth 세션은 대시보드 로그인 상태로 취급하지 않음
      if (u && !u.isAnonymous) {
        setUser(u);
        setAccess(await getUserAccess(u.uid));
      } else {
        setUser(null);
        setAccess(null);
      }
      setReady(true);
    });
  }, []);

  async function login() {
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, access, ready, login, logout };
}
