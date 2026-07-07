# chair-exercise-tracker — PLAN

> 이 문서는 프로젝트의 유일한 진실 공급원(single source of truth)입니다.
> 매 세션 시작 시 Claude Code가 가장 먼저 읽습니다.

## 🔔 전략 세션 반영 필요
_(정책성 변경 발생 시 날짜와 함께 여기에 기록)_

- 2026-07-06: `CLAUDE.md` 전체 교체 — 프로젝트 전용 규칙(A: 코드작성 게이트, PLAN.md 중심 운영, DO/CHECK/ACT 사이클, 브랜치·커밋 규칙, Firebase 데이터 분리) + 일반 행동 지침(B) 구조로 재편.
- 2026-07-06: 기기 자가등록 구조적 실패 문제 해결 방향 확정 — (1) 클라이언트 사전 존재확인 read 제거, `profiles` write 규칙에 "미등록 기기의 자가등록(자기 uid만 추가)" 예외 추가. (2) 프로필당(father/mother 각각) `deviceUids` 최대 2대 상한 — 오늘의 운동 입력용 익명 기기 등록에만 적용, 대시보드(구글 로그인) 열람은 제한 없음. (3) "오늘의 운동" 화면에서 폰이 아닌 기기 접속 시 안내 문구 표시 + 체크 버튼 비활성화(보안 차단 아닌 UX 안내 수준), 대시보드에는 미적용.
- 2026-07-07: `.env`는 `.gitignore` 대상이라 세션(컨테이너)마다 파일 자체가 존재하지 않을 수 있음을 확인 (Claude Code on the web은 매 세션 컨테이너를 새로 생성) → PLAN.md의 과거 "[x] .env 값 채움" 같은 체크는 "그 세션에서 채운 사실"만 의미하며, 새 세션에서 파일이 실제로 존재/채워져 있음을 보장하지 않음. 새 세션에서 배포/빌드 관련 작업 시작 시 `.env` 실존 여부를 먼저 확인할 것.

## 현재 브랜치
- `claude/firestore-rules-deploy-i6x548` — `firestore.rules` 실제 배포 완료.
- 다음 기능 작업 시작 시 이 브랜치에서 계속 진행하거나, 필요하면 새 브랜치를 판다.

## 결정 필요 항목 (구현 전 확정 필요 — `CLAUDE.md` A-6 참고)
모두 확정됨. 상세 근거는 `context-notes.md` 참고.
- [x] 기록 화면 쓰기 인증 방식 → **Anonymous Auth 기기 매핑** (기기별 익명 uid를 `profiles/{profileId}.deviceUids`에 등록)
- [x] 자녀 계정 role 부여 방법 → **수동 설정** (Firestore 콘솔에서 `users/{uid}.role`, `allowedProfiles` 직접 입력, v1 한정)
- [x] 오프라인 대비 방식 → **Firestore 기본 오프라인 퍼시스턴스만 사용**, 별도 안내 배너 없음
- [x] 알림 시간 커스터마이징 여부 → **설정 화면에서 프로필별 변경 가능** (스펙의 "v1 고정 20시" 대신 확장 — Cloud Functions 스케줄러 필요해짐)

## 남은 작업 (To-Do)
코드/스키마/규칙은 모두 작성 완료.
- [x] `TodayExercise.jsx`의 loadDay/loadStreak가 `ready`를 기다리지 않고 실행되던 버그 + 신규 기기 등록 완료 전 읽기 시도로 permission-denied 나던 버그 수정 (`claude/todayexercise-profile-init-order-xns6yu` 브랜치, 아래 완료 작업 참고)
- [x] Firebase 신규 프로젝트 실제 생성 (`chairexercise-bfd03`, MyAssetDashBD/Pension-tracer와 분리) — `.env` 값 채움
- [ ] FCM 웹 푸시 인증서(VAPID 키) 재확인 — `.env`는 `.gitignore` 대상이라 세션(컨테이너) 간 보존되지 않음. 2026-07-07 재작업 시 `VITE_FIREBASE_VAPID_KEY` 값을 못 받아 빈 값으로 둠(FCM 푸시 전송 전에 콘솔에서 재확인해 채워야 함). `check-env.mjs`가 이제 이 키 누락 시 경고를 출력하니 `npm run build` 로그에서 확인 가능
- [x] GitHub Pages 실제 배포 실행 (`npm run deploy`) — `gh-pages` 브랜치 생성 및 배포 완료
- [ ] 저장소 Settings > Pages에서 Source가 `gh-pages` 브랜치로 지정돼 있는지 확인 (최초 배포 시 수동 확인 필요할 수 있음)
- [x] Firebase Auth 콘솔에서 Google 로그인 + Anonymous 로그인 활성화 확인 완료 (2026-07-07, 콘솔 스크린샷으로 둘 다 "사용 설정됨" 확인)
- [x] Firestore 보안 규칙(`firestore.rules`) 실제 배포 (시나리오별 테스트는 이전 작업에서 에뮬레이터로 검증 완료)
- [x] `firestore.rules` 재배포 (`deviceUidsOf`/`allowedProfiles` 필드 부재 버그 수정판) — 서비스 계정 키 없이 **Firebase 콘솔 규칙 탭에서 직접 붙여넣기 + 게시(Publish)**로 배포 완료 (2026-07-07), 실사이트에서 프로필 선택 정상 동작 확인
- [ ] Cloud Functions(`functions/`) 배포 — 보류 (비용 사유로 v1 제외 확정, 2026-07-07). 요금제(Blaze) 부담으로 배포하지 않기로 함. `functions/` 코드는 삭제하지 않고 유지 — 추후 필요 시 배포만 하면 됨
- [ ] 실기기 알림 수신 테스트 (안드로이드)
- [ ] `users/{자녀uid}.role = "child"` 수동 등록 (실제 배포 후)
- [x] 기기 자가 등록(`registerDeviceForProfile`) 구조적 실패 문제 해결 — 클라이언트 존재확인 read 제거 + `profiles` write 규칙에 자가등록 예외(자기 uid만 추가, 최대 2대) 추가, 에뮬레이터로 검증 완료
- [x] "오늘의 운동" 화면 PC/태블릿 접근 안내 문구 + 체크 버튼 비활성화 추가
- [x] 빌드 전 `.env` 필수 키 검증(`scripts/check-env.mjs`) + `src/firebase.js` 런타임 가드 + `.env.example` 안내 주석 추가

## 완료된 작업
| 날짜 | 내용 |
|---|---|
| 2026-07-06 | 기획 스펙 문서(`chair-exercise-tracker-spec.md`) 및 초기 `CLAUDE.md` 작성 |
| 2026-07-06 | 결정 필요 항목 4개 확정 (위 목록 참고) |
| 2026-07-06 | v1 전체 구현: Vite+React+Firebase 스캐폴딩, Firestore 데이터 레이어·보안 규칙, "오늘의 운동" 화면(기기 프로필/체크·메모/진행률 링/스트릭/축하 연출/과거 날짜), "기록 보기" 대시보드(구글 로그인/프로필 전환/일·주·월·분기·년 탭/통계 카드/메모 모아보기), 알림 설정 화면 + FCM + Cloud Functions 스케줄 발송. PR #1로 main 병합 (커밋 `972c03e`). 빌드 확인 완료(`npm run build`) |
| 2026-07-06 | `CLAUDE.md` 전체 교체 (프로젝트 전용 규칙 A + 일반 지침 B 구조) |
| 2026-07-06 | GitHub Pages 사이트가 빈 화면인 원인 조사(gh-pages 브랜치 미존재 확인) → Firebase 프로젝트(`chairexercise-bfd03`) 신규 생성 및 `.env` 값 채움 → 빌드 확인(`npm run build`) → `npm run deploy`로 GitHub Pages 최초 배포 완료 (타 프로젝트 MyAssetDashBD/Pension-tracer 영향 없음) |
| 2026-07-06 | "어머니 선택 후 불러오는 중 멈춤" 버그 조사 → `firestore.rules`의 `records/{profileId}/days/{date}` 읽기 규칙에 `isDeviceOfProfile` 체크가 빠져있던 버그 발견·수정, `allowedProfiles`/`deviceUidsOf`를 `exists()` 가드로 안전하게 개선(존재하지 않는 문서 `get()` 시 예외 대신 빈 배열 반환). `TodayExercise.jsx`에 로딩 에러 상태 추가(무한 스피너 대신 에러 메시지 표시). Firestore 에뮬레이터(`@firebase/rules-unit-testing`)로 직접 재현·검증하는 과정에서 **더 근본적인 별도 문제 발견**: `registerDeviceForProfile()`의 존재확인 `getDoc()` 자체가 신규/기존 프로필 관계없이 항상 권한 거부되어 기기 자가등록이 구조적으로 항상 실패함(에뮬레이터로 실증). 이 문제는 A-6에서 결정된 "Anonymous Auth 기기 매핑" 방식의 보안 규칙 재설계가 필요해 사용자 결정 대기 중(위 남은 작업 참고). `npm run build` 통과 확인. 타 프로젝트 영향 없음 |
| 2026-07-06 | 기기 자가등록 문제 해결(위 전략 세션 로그 참고): `src/lib/profiles.js`의 `registerDeviceForProfile()`에서 사전 존재확인 `getDoc()` 제거, 항상 `setDoc(merge:true)` + `arrayUnion`으로 단순화. `firestore.rules`에 `isSelfDeviceRegistration()` 함수 추가 — 미등록 기기가 `name`/`deviceUids` 외 필드는 건드리지 않고 자기 uid 하나만 추가하는 경우만 허용, 프로필당 `deviceUids` 최대 2대 상한 적용(`allow create` 규칙은 이 함수로 대체되어 제거, 이전에는 로그인만 하면 누구나 임의 내용으로 프로필 문서를 생성할 수 있던 허점도 함께 닫힘). `src/lib/device.js` 신규 추가(`isMobileDevice()` — `navigator.userAgentData.mobile` 우선, `navigator.userAgent`의 "Mobile" 포함 여부로 폴백). `TodayExercise.jsx`에 PC/태블릿 접속 시 안내 문구(`.device-notice`, `App.css`에 스타일 추가) 표시 및 `ExerciseCard`의 체크 버튼 비활성화(`disabled` prop 추가) — 보안 차단이 아닌 UX 안내이며 대시보드에는 미적용. Firestore 에뮬레이터로 7개 시나리오(신규 생성/2대까지 등록/3대째 거부/records 읽기/설정 변경/자가등록 위장 필드변경 거부/타 기기 제거 시도 거부) 모두 기대대로 동작 확인. `npm run build` 통과. 타 프로젝트 영향 없음 |
| 2026-07-06 | 대시보드에 자녀 계정 전용 "프로필 관리" 기능 2종 추가: `src/components/ProfileManagement.jsx` 신규(아버지/어머니 각각 "기기 등록 초기화"/"기록 데이터 초기화" 버튼, 기록 삭제는 프로필 이름 직접 입력 확인). `src/lib/profiles.js`에 `resetDeviceUids()`(deviceUids만 빈 배열로 merge), `src/lib/records.js`에 `deleteAllDaysForProfile()`(500건 단위 batched delete) 추가. `Dashboard.jsx`는 `access.role === "child"`일 때만 이 섹션을 렌더링하고, 기록 삭제 후 현재 보고 있는 프로필이면 통계/일별 뷰를 즉시 재조회. `firestore.rules`에 `isChildOf()`/`isChildDeviceReset()` 함수 추가 — `profiles` write에 "자녀가 deviceUids만 빈 배열로 재설정"하는 경우 허용(다른 필드 동시 변경/빈 배열이 아닌 값은 거부), `records/{profileId}/days/{date}`에 자녀 전용 `allow delete` 추가(부모 기기의 기존 write 권한과 완전히 별개). `@firebase/rules-unit-testing@4`(firebase 11.x와 호환) + `firebase-tools`를 devDependency로 추가하고 `npm run test:rules` 스크립트로 12개 시나리오(기기 초기화가 records/다른 프로필에 영향 없음, 기록 삭제가 deviceUids/다른 프로필에 영향 없음, deviceUids 초기화 시 다른 필드 동시 변경·비어있지 않은 값 거부, allowedProfiles 밖 프로필 차단, role≠child 차단, 기존 부모 기기 write 회귀 없음) 모두 통과 확인. `npm run build` 통과. 타 프로젝트 영향 없음 |
| 2026-07-07 | `firestore.rules` 실제 배포: 사용자가 발급한 Firebase 서비스 계정 키로 `firebase deploy --only firestore:rules --project chairexercise-bfd03` 실행. 프로젝트 바인딩을 위해 `.firebaserc` 신규 추가(커밋 `bf22923`). 배포 과정에서 서비스 계정에 `serviceusage.serviceUsageConsumer`, `firebaserules.admin` IAM 역할이 없어 403 오류 발생 → 사용자가 Google Cloud IAM 콘솔에서 두 역할 추가 후 배포 성공(`Deploy complete!`, 콘솔: https://console.firebase.google.com/project/chairexercise-bfd03/overview). 규칙 자체 변경 없음(기존 파일 그대로 배포). 사용한 서비스 계정 키는 세션 종료 후 Firebase 콘솔에서 폐기(rotate) 권장. 타 프로젝트 영향 없음 |
| 2026-07-07 | "새로고침 없이 새 프로필 열면 기록이 안 불러와지는" 버그 조사·수정: `TodayExercise.jsx`의 loadDay/loadStreak useEffect가 `useDeviceProfile`의 `ready`를 기다리지 않고 실행되던 문제 확인(가드 없음 + 의존성 배열에 `ready` 미포함이라 ready가 true로 바뀌어도 재시도 안 되는 문제 포함) → `if (!ready) return;` 가드 추가 + 의존성에 `ready` 포함. 근본 원인은 `useDeviceProfile.js`의 `setProfileId()`가 `registerDeviceForProfile()` 완료(await) 전에 `setProfileIdState`를 먼저 호출해, 신규 기기가 `profiles/{profileId}.deviceUids`에 등록되기 전에 `records` 읽기를 시도해 `firestore.rules`의 `isDeviceOfProfile` 조건 미충족으로 permission-denied 발생하던 것 → 등록 완료 후에 state를 반영하도록 순서 변경. `tests/profile-init-order.test.mjs` 신규 추가(등록 전 읽기 거부, 등록 완료 후 새로고침 없이 즉시 읽기 성공 시나리오)로 에뮬레이터 검증, 기존 `firestore-rules.test.mjs`(12개 시나리오)도 함께 통과 확인. `npm run build` 통과. `claude/todayexercise-profile-init-order-xns6yu` 브랜치에 커밋·푸시, PR #10 → main 병합, GitHub Pages 재배포 완료. 타 프로젝트 영향 없음 |
| 2026-07-07 | CLAUDE.md A-4에 "개발 브랜치 푸시 완료 후 항상 PR 생성·병합까지 완료해 main에 배포" 규칙 추가 (PR #11 → main 병합) |
| 2026-07-07 | 빌드 전 `.env` 필수 키 검증 + Firebase 설정 누락 런타임 가드 추가: `scripts/check-env.mjs` 신규(누락 키 있으면 `npm run build` 실패), `package.json`의 `build` 스크립트에 연결. `.env.example`에 키 분실 시 Firebase 콘솔 재확인 경로 안내 주석 추가. `src/firebase.js`에 `firebaseConfig` 값 누락 시 한국어 에러를 던지는 런타임 가드 추가. CLAUDE.md에 A-7(배포 검증) 신규 — 배포는 `npm run deploy` 성공 메시지가 아니라 실기기/브라우저 정상 로딩 확인까지가 완료 기준임을 명시. 더미 `.env`로 성공/실패 경로 모두 확인, `npm run test:rules`(13개 시나리오) 회귀 없음 확인. PR #12 → main 병합. 타 프로젝트 영향 없음 |
| 2026-07-07 | 빌드된 사이트의 `auth/invalid-api-key` 에러 조사: 현재 세션 컨테이너에 `.env` 파일 자체가 없음을 확인(`.env.example`만 존재) — `.env`는 `.gitignore` 대상이라 새 컨테이너에는 자동 복원되지 않음이 근본 원인. 사용자가 Firebase 콘솔에서 `firebaseConfig` 값을 다시 제공(`chairexercise-bfd03` 프로젝트, 기존과 동일)하여 `.env` 재생성. `VITE_FIREBASE_VAPID_KEY`는 이번에 제공받지 못해 빈 값으로 둠(FCM 푸시 발송 전 재확인 필요, 위 "남은 작업" 참고). `npm install` 후 `npm run build` 통과(`check-env.mjs` 통과 + `vite build` 성공) 확인, 빌드 산출물(`dist/assets/*.js`)에 프로젝트ID/API 키가 정상 반영됐음을 grep으로 확인. 코드 변경 없음(로컬 `.env` 파일만 생성, git 추적 대상 아님이라 커밋할 내용 없음). 타 프로젝트 영향 없음 |
| 2026-07-07 | `CLAUDE.md`에 A-8(세션 시작 시 `.env` 확인) 신규 추가. `scripts/check-env.mjs`에 `RECOMMENDED_KEYS`(`VITE_FIREBASE_VAPID_KEY`) 도입 — 없어도 빌드는 통과시키되 경고 로그만 출력(FCM 푸시만 영향, 핵심 기능 무관하므로 하드 실패 대상인 `REQUIRED_KEYS`에는 넣지 않음). `.env` 있음/필수 키 정상 상태에서 경고 출력 확인, `.env` 통째로 없는 경우 여전히 하드 실패(exit 1)하는 회귀 확인, `npm run test:rules`(13개 시나리오) 회귀 없음 확인. 병합된 PR #14 히스토리 위에 브랜치를 새로 얹지 않고 origin/main 기준으로 브랜치 재시작 후 작업. 타 프로젝트 영향 없음 |
| 2026-07-07 | `CLAUDE.md` A-7(배포 검증) 규칙 확장: `src/`/`.env`/`firestore.rules`/`package.json` 등 배포에 영향 주는 파일 변경 시 "코드작업완료" 선언에 `npm run build` → `npm run deploy` → 실제 사이트 정상 로딩 확인이 예외 없이 포함되도록 명시(생략하려면 매번 사용자에게 먼저 물어야 함). 이 변경 자체는 문서(`CLAUDE.md`)만 수정한 것이라 A-7 적용 대상 아님 — 배포 없이 문서 커밋만 진행. 병합된 PR #15 히스토리 위에 브랜치를 새로 얹지 않고 origin/main 기준으로 브랜치 재시작 후 작업. 타 프로젝트 영향 없음 |
| 2026-07-07 | 실사이트 콘솔에서 발견된 `Uncaught FirebaseError: Missing or insufficient permissions` 원인 조사·수정: `firestore.rules`의 `deviceUidsOf()`/`allowedProfiles()`가 문서 "존재 여부"만 확인하고 그 안의 `deviceUids`/`allowedProfiles` **필드 존재 여부는 확인하지 않아**, Firebase 콘솔에서 수동 생성되어 해당 필드가 아예 없는 문서(`profiles/father` 등, 사용자가 콘솔에서 "등록된 기기 없음" 상태로 확인)에 대해 `.data.deviceUids`가 `null`을 반환 → 이후 `in`/`hasAll()` 같은 리스트 연산에서 규칙 평가 오류가 나 결과적으로 permission-denied로 이어지던 버그. `.data.get('deviceUids', [])` / `.data.get('allowedProfiles', [])`(맵의 안전한 기본값 접근자)로 교체해 필드 부재 시에도 빈 배열을 반환하도록 수정. `tests/firestore-rules.test.mjs`에 회귀 시나리오 2개 추가(① `deviceUids` 필드 없는 문서에서 신규 기기 자가등록 성공, ② `allowedProfiles` 필드 없는 users 문서는 평가 오류 없이 접근 거부) — 기존 7개 시나리오 포함 9개 모두 통과, `tests/profile-init-order.test.mjs` 회귀 없음 확인. 추가로 `src/hooks/useDeviceProfile.js`의 `registerDeviceForProfile()` 호출에 `.catch(() => {})` 방어 처리 추가(등록 실패가 uncaught promise rejection으로 콘솔에 노출되던 것 방지, 실패 시 사용자 노출은 기존 `loadDay`의 `loadError` 경로로 유지됨). `npm run build` 통과. **배포 관련 예외**: `firestore.rules` 실제 배포(`firebase deploy --only firestore:rules`)는 지난 세션에 서비스 계정 키를 폐기해 이번 세션 권한이 없어 미실행 — 사용자가 직접 배포하거나 새 서비스 계정 키 필요. 정적 사이트는 `npm run build`+`npm run deploy`로 gh-pages 재배포 완료(번들 변경사항 반영, 실사이트 콘솔 확인은 사용자에게 요청). 타 프로젝트 영향 없음 |
| 2026-07-07 | Cloud Functions 배포는 Blaze 요금제 비용 부담으로 v1 스코프에서 제외하기로 확정(사용자 결정). `src/pages/Settings.jsx`의 알림 시간 설정 UI 위에 "알림 발송 기능은 현재 준비 중입니다" 안내 문구(`notif-notice`, `App.css`에 스타일 추가, 기존 `.device-notice`와 동일 톤) 추가 — 시간 설정 저장과 "이 기기에서 알림 받기"(FCM 토큰 등록) 버튼은 그대로 유지해 추후 Cloud Functions 배포 시 바로 쓸 수 있게 함. `functions/` 코드는 삭제하지 않고 보존. `npm run build` 통과. 타 프로젝트 영향 없음 |
| 2026-07-07 | 위 수정 배포 후에도 "아버지/어머니 선택 클릭이 반응은 있으나 화면 전환이 안 됨" 재발 확인 → 근본 원인 추적: (1) `useDeviceProfile.js`의 `setProfileId()`가 `registerDeviceForProfile()` 실패 시 `await`에서 예외를 던져 그 아래 `setProfileIdState(id)`까지 도달 못해 화면 전환이 막히는 구조임을 코드 분석으로 확인. (2) 에뮬레이터로 "배포된(수정 전) 규칙 + `deviceUids: []`가 이미 있는 문서" 조합을 재현했더니 write가 **성공**해서, "필드 부재" 가설만으로는 실사이트 실패를 설명 못 한다는 모순 발견. (3) Firebase Auth 콘솔에서 Google/Anonymous 로그인 둘 다 활성화 확인되어 로그인 문제도 배제. (4) Firebase 콘솔의 **규칙 놀이터(Rules Playground)**로 실제 배포된 규칙 + 실제 프로덕션 문서(`profiles/father`)를 대상으로 직접 시뮬레이션한 결과 `Error: ... Property deviceUids is undefined on object` (정확히 `deviceUidsOf()`의 `.data.deviceUids` 라인)로 확정 — 콘솔 UI에서 `deviceUids: []`로 보였던 것과 달리 실제 문서에는 해당 필드가 저장되어 있지 않았음이 실증됨. 즉 최초 진단이 맞았고, 남은 건 배포뿐이었음. (5) 서비스 계정 키 없이 배포하는 방법으로 **Firebase 콘솔의 Firestore 규칙 탭에서 수정된 규칙 전문을 직접 붙여넣고 "게시(Publish)"**하는 방법을 안내 → 사용자가 직접 게시 완료. (6) 실사이트에서 "아버지/어머니" 프로필 선택이 정상적으로 화면 전환됨을 사용자가 최종 확인. **Firebase CLI/서비스 계정 키가 없어도 Firebase 콘솔에서 직접 규칙을 게시할 수 있다는 점을 향후 배포 방법으로 기록해둠.** 타 프로젝트 영향 없음 |

## 프로젝트 개요 — 데이터 모델 (요약)
> 상세는 `chair-exercise-tracker-spec.md` 5장 참고. 스키마 변경 시 이 섹션도 함께 갱신.

```
profiles/{profileId}          // "father" | "mother"
  ├ deviceUids: string[]      // Anonymous Auth uid 매핑 (쓰기 권한 판단)
  ├ notificationTime: "HH:mm" // 프로필별 알림 시간 (KST)
  └ fcmTokens: string[]

records/{profileId}/days/{date}
  ├ exercises: { "1": {done, memo?}, ..., "8": {done, memo?} }
  ├ completedCount: number
  └ updatedAt

users/{uid}
  ├ role: "parent" | "child"
  └ allowedProfiles: string[]
```

## 화면 구성 (요약)
| 화면 | 대상 | 상태 |
|---|---|---|
| 오늘의 운동 (`/`) | 아버지/어머니 | 구현 완료 (실배포 전) |
| 기록 보기 대시보드 (`/dashboard`) | 아버지/어머니/자녀 | 구현 완료 (실배포 전) |
| 알림 설정 (`/settings`) | 아버지/어머니 | 구현 완료 (실배포 전) |

## 참고 문서
- `chair-exercise-tracker-spec.md` — 기획 원본 스펙
- `context-notes.md` — v1 구현 중 세부 결정과 근거 (append-only)
- `checklist.md` — v1 구현 세부 체크리스트 (완료 상태 기록용, 이후 신규 작업은 본 PLAN.md의 "남은 작업"으로 관리)
