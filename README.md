# chair-exercise-tracker

의자운동앱

기획 배경과 데이터 모델은 [`chair-exercise-tracker-spec.md`](./chair-exercise-tracker-spec.md), 구현 중 결정사항은 [`context-notes.md`](./context-notes.md), 진행 상황은 [`checklist.md`](./checklist.md)를 참고.

## 로컬 개발

```bash
npm install
cp .env.example .env   # Firebase 콘솔에서 발급받은 값 채우기
npm run dev
```

## Firebase 프로젝트 준비 (사용자가 직접 수행)

1. Firebase 콘솔에서 신규 프로젝트 생성 (기존 자산 대시보드와 분리).
2. Authentication에서 **Google 로그인**, **Anonymous 로그인** 모두 활성화.
3. Firestore 생성 후 `firestore.rules`, `firestore.indexes.json` 배포:
   ```bash
   firebase deploy --only firestore
   ```
4. Cloud Messaging에서 웹 푸시 인증서(VAPID 키) 발급 → `.env`의 `VITE_FIREBASE_VAPID_KEY`에 입력.
5. `users/{자녀uid}.role = "child"`, `allowedProfiles = ["father","mother"]`를 Firestore 콘솔에서 수동 입력 (v1 결정사항).
6. 알림 발송용 Cloud Functions 배포 (Blaze 요금제 필요):
   ```bash
   cd functions && npm install && cd ..
   firebase deploy --only functions
   ```

## 빌드 & GitHub Pages 배포

```bash
npm run build
npm run deploy   # gh-pages 브랜치로 dist/ 배포
```

## 화면 구성

- `/` 오늘의 운동 — 기기별 고정 프로필, 로그인 없음
- `/dashboard` 기록 보기 — 구글 로그인 필요
- `/settings` 알림 시간 설정 (프로필별)
