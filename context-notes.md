# Context Notes

작업 중 내린 결정과 그 이유를 기록합니다. 다음 세션(사람이든 에이전트든)이 왜 이렇게 했는지 재추론하지 않아도 되도록 append-only로 유지합니다.

## 2026-07-06 — 킥오프

### 저장소 초기 상태 확인
- 저장소에는 `CLAUDE.md`, `README.md`, `chair-exercise-tracker-spec.md` (사용자가 직접 커밋)만 존재.
- 코드는 전혀 없음. 이번 세션에서 v1 전체를 새로 구현.

### 스펙 7장 미결정 항목 4가지 — 사용자 확정 답변

1. **기록 화면 쓰기 인증**: Firebase **Anonymous Auth**로 기기별 익명 계정을 생성하고, 최초 프로필 선택 시 그 uid를 `profiles/{profileId}.deviceUids` 배열에 등록. Firestore 규칙에서 `request.auth.uid in profiles/{profileId}.deviceUids`일 때만 해당 profile의 records 쓰기 허용.
2. **자녀 role 부여**: v1은 **수동**. Firestore 콘솔에서 `users/{uid}.role = "child"`, `allowedProfiles = ["father","mother"]`를 직접 입력. 온보딩 코드 플로우는 만들지 않음.
3. **오프라인 동기화**: Firestore SDK의 **기본 오프라인 퍼시스턴스(enableIndexedDbPersistence)** 만 사용. 별도 안내 배너 없음 — pending write는 Firestore가 자동 처리.
4. **알림 시간 커스터마이징**: 스펙의 "v1은 고정 8시도 무방" 대신 **설정 화면에서 변경 가능**하게 구현하기로 함(사용자가 명시적으로 선택). 이로 인해 클라이언트만으로는 예약 발송이 불가능하므로 **Cloud Functions 스케줄 함수**가 필요해짐 — 아래 "알림 아키텍처" 참고.

### 알림 아키텍처 (설정 가능 시간 대응)
- `profiles/{profileId}`에 `notificationTime: "HH:mm"` (KST 기준), `fcmTokens: string[]` 필드 추가.
- Cloud Functions: `functions/` 디렉터리에 pub/sub 스케줄 함수(15분 간격)를 두고, 현재 KST 시각(15분 단위 반올림)과 일치하는 `notificationTime`을 가진 프로필에게 FCM 멀티캐스트 발송.
- 타임존은 한국(Asia/Seoul) 고정으로 가정 — 스펙상 사용자가 모두 한국 거주 가족이므로 별도 타임존 설정 UI는 만들지 않음.
- **주의**: Cloud Functions 배포는 Firebase **Blaze(종량제) 요금제**가 필요. 스펙의 GitHub Pages 정적 배포와 별개로, Functions는 `firebase deploy --only functions`로 사용자가 직접 배포해야 함(이 세션에서는 배포 자격 증명이 없어 코드만 작성).

### 기술 스택 세부 결정
- **빌드 도구**: Vite + React (기존 프로젝트 컨벤션을 정확히 알 수 없어 React 생태계에서 가장 표준적인 선택인 Vite 사용).
- **차트**: `recharts` 사용 (주/월/분기/년 막대그래프). 커스텀 SVG로 직접 구현하는 대신 검증된 라이브러리로 엣지케이스(빈 데이터, 반응형 크기) 리스크를 줄임.
- **달력 히트맵**: 별도 라이브러리 없이 CSS grid로 직접 구현 (월 단위라 로직이 단순함).
- **배포**: GitHub Pages, `vite.config.js`의 `base`를 저장소 이름(`/chair-exercise-tracker/`)으로 설정. `gh-pages` npm 패키지로 `dist/`를 `gh-pages` 브랜치에 배포.

### Firebase 프로젝트 자체는 이 세션에서 생성 불가
- 실제 Firebase 프로젝트 생성, API 키 발급, Google/Anonymous Auth 활성화, FCM VAPID 키 발급은 Firebase 콘솔에서 사용자가 직접 해야 함.
- 코드는 `.env` 기반으로 Firebase config를 주입받도록 작성 (`.env.example` 제공). 실제 `.env`는 git에 커밋하지 않음.
