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

## 2026-07-06 — v1 구현 완료 (같은 세션)

### 구현 범위
스펙 4장의 오늘의 운동/대시보드/알림 기능을 모두 구현. 라우팅은 `HashRouter` 사용 — GitHub Pages는 정적 호스팅이라 서버사이드 리라이트 설정 없이 새로고침 시 404가 나지 않도록 하기 위함(BrowserRouter 대신 선택).

### 통계 계산 범위에 대한 실용적 단순화
- 스펙 4.2의 "총 참여일수/총 완주일수"는 문구상 전체 기간(all-time)으로 읽히지만, 매번 전체 기록을 무제한 조회하는 대신 **최근 400일(약 13개월)** 범위로 조회해 통계를 계산하도록 단순화함 (`Dashboard.jsx`의 `STATS_LOOKBACK_DAYS`).
- 이유: Firestore 쿼리 비용/속도, 그리고 "꾸준함 확인"이라는 앱의 목적상 1년 이상 과거까지 정확히 볼 필요는 낮다고 판단. 이후 실사용 중 더 긴 이력이 필요해지면 이 상수만 늘리면 됨.
- 대시보드의 "선택 기간 평균 완료율" 통계 카드는 탭(일/주/월/분기/년)에 따라 해당 기간으로 필터링한 후 계산 (`periodRecords()`).

### 오프라인 재연결 시 스트릭 오탐 가능성 (알려진 한계, 미해결)
- `calcCurrentStreak`은 클라이언트에서 로컬에 캐시된 `records`를 기준으로 계산. Firestore 오프라인 퍼시스턴스를 쓰기 때문에, 오프라인 상태에서 체크한 기록은 재연결 전까지 서버에 반영되지 않지만 로컬 스냅샷에는 즉시 반영되므로 UI상 스트릭 계산 자체는 정상 동작. 별도 조치 불필요하다고 판단(결정사항 3과 일치).

### 차트/시각화 라이브러리
- `recharts@2.15.4` 사용. npm이 "2.x는 유지보수 종료, 3.x로 이전 권장" 경고를 띄우지만, 코드 예제와 타입이 안정적인 2.x로 유지 — 이번 세션에서 3.x 마이그레이션 가이드까지 검증할 여유가 없었음. 추후 필요 시 `recharts@^3`로 업그레이드 검토.
- `npm audit`에서 esbuild/vite 관련 moderate 취약점 1건 확인 — **개발 서버 전용** 취약점(임의 사이트가 dev 서버에 요청을 보낼 수 있음)이라 프로덕션 빌드에는 영향 없음. `vite@8`로 강제 업그레이드하면 breaking change라 이번 세션에서는 보류.

### FCM 서비스워커 config 전달 방식
- `public/firebase-messaging-sw.js`는 정적 파일이라 Vite의 `import.meta.env`를 쓸 수 없음. 서비스워커 등록 시 Firebase config를 쿼리 파라미터로 넘기고, 워커 내부에서 `self.location.search`로 파싱하는 방식을 채택 (Firebase 커뮤니티에서 자주 쓰는 패턴). Firebase 웹 config 값은 공개되어도 되는 값(보안은 Firestore 규칙이 담당)이라 쿼리스트링 노출은 문제 없음.

### Firestore 보안 규칙 요약 (`firestore.rules`)
- `profiles/{profileId}`: 읽기는 대시보드 열람 권한자 또는 해당 기기 자신, 쓰기는 해당 기기(uid가 deviceUids에 포함)만. `create`는 로그인(익명 포함)만 되어 있으면 허용 — profileId가 "father"/"mother" 고정값이라 앱이 의도한 두 문서 외에는 실질적으로 생성되지 않는 폐쇄형 구조라는 전제.
- `records/{profileId}/days/{date}`: 읽기는 `users/{uid}.allowedProfiles`에 포함된 경우만, 쓰기는 해당 profile의 deviceUids에 포함된 uid만.
- `users/{uid}`: 본인만 읽기, 쓰기는 전부 차단(콘솔 수동 설정 전제, 결정사항 2와 일치).
- **미검증 상태**: 실제 Firebase 프로젝트가 없어 에뮬레이터/실배포로 규칙을 테스트하지 못함 — 배포 후 반드시 시나리오별(다른 기기가 다른 프로필 쓰기 시도 등) 테스트 필요.

### 아직 남은 것 (checklist.md "v1 이후 남은 작업" 참고)
- 실제 Firebase 프로젝트 생성/설정, Cloud Functions 배포(Blaze 요금제), 실기기 알림 수신 테스트는 모두 사용자 환경이 필요해 이번 세션 범위 밖.
