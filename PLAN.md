# chair-exercise-tracker — PLAN

> 이 문서는 프로젝트의 유일한 진실 공급원(single source of truth)입니다.
> 매 세션 시작 시 Claude Code가 가장 먼저 읽습니다.

## 🔔 전략 세션 반영 필요
_(정책성 변경 발생 시 날짜와 함께 여기에 기록)_

- 2026-07-06: `CLAUDE.md` 전체 교체 — 프로젝트 전용 규칙(A: 코드작성 게이트, PLAN.md 중심 운영, DO/CHECK/ACT 사이클, 브랜치·커밋 규칙, Firebase 데이터 분리) + 일반 행동 지침(B) 구조로 재편.
- 2026-07-06: 작업 사이클에 "기능검증" 단계 추가 (DO → CHECK → 기능검증 → ACT). 코드 작성 전 영향도 분석·보고는 예외 없이 선행. 메뉴별 기능검증 시나리오는 아래 "기능검증 시나리오" 섹션에서 관리하고, 완료 보고 전 해당 시나리오를 실제로 확인한다.

## 현재 브랜치
- `claude/chair-tracker-visibility-s7xrdj` — GitHub Pages 사이트가 빈 화면으로 보이는 문제(gh-pages 브랜치 자체가 없어 미배포 상태였음) 조사 및 실제 배포 작업 진행 중.
- 다음 기능 작업 시작 시 이 브랜치에서 계속 진행하거나, 필요하면 새 브랜치를 판다.

## 결정 필요 항목 (구현 전 확정 필요 — `CLAUDE.md` A-6 참고)
모두 확정됨. 상세 근거는 `context-notes.md` 참고.
- [x] 기록 화면 쓰기 인증 방식 → **Anonymous Auth 기기 매핑** (기기별 익명 uid를 `profiles/{profileId}.deviceUids`에 등록)
- [x] 자녀 계정 role 부여 방법 → **수동 설정** (Firestore 콘솔에서 `users/{uid}.role`, `allowedProfiles` 직접 입력, v1 한정)
- [x] 오프라인 대비 방식 → **Firestore 기본 오프라인 퍼시스턴스만 사용**, 별도 안내 배너 없음
- [x] 알림 시간 커스터마이징 여부 → **설정 화면에서 프로필별 변경 가능** (스펙의 "v1 고정 20시" 대신 확장 — Cloud Functions 스케줄러 필요해짐)

## 남은 작업 (To-Do)
코드/스키마/규칙은 모두 작성 완료.
- [x] Firebase 신규 프로젝트 실제 생성 (`chairexercise-bfd03`, MyAssetDashBD/Pension-tracer와 분리) — `.env` 값 채움
- [x] FCM 웹 푸시 인증서(VAPID 키) 발급 — `.env`에 반영
- [x] GitHub Pages 실제 배포 실행 (`npm run deploy`) — `gh-pages` 브랜치 생성 및 배포 완료, Settings > Pages 자동 인식 확인됨
- [x] Firebase Auth 콘솔에서 Google 로그인 + Anonymous 로그인 활성화 확인
- [x] Firestore Database 실제 생성 (asia-northeast3)
- [x] Firestore 보안 규칙(`firestore.rules`) 콘솔에 배포 — 배포 중 발견된 버그 2건 수정 후 반영
  - `records` 읽기 규칙에 기기(익명 Auth) 기반 접근 허용 누락 → 추가
  - `profiles` 읽기 규칙이 문서 미존재 시(최초 등록 부트스트랩) 항상 거부되던 문제 → `!exists()` 조건 추가
- [x] "오늘의 운동" 실사용 확인 — 아버지 프로필 선택, 운동 체크 시 진행률(0/8 → 상승) 정상 반영
- [ ] Google 로그인 사용 시 `auth/unauthorized-domain` 에러 확인됨 — Authentication > Settings > Authorized domains에 `jungukeu-ctrl.github.io` 추가 필요 (기록 보기 대시보드 로그인 전에 처리 필요)
- [ ] Cloud Functions(`functions/`) 배포 — Blaze(종량제) 요금제 필요
- [ ] 실기기 알림 수신 테스트 (안드로이드)
- [ ] `users/{자녀uid}.role = "child"` 수동 등록 (실제 배포 후)

## 완료된 작업
| 날짜 | 내용 |
|---|---|
| 2026-07-06 | 기획 스펙 문서(`chair-exercise-tracker-spec.md`) 및 초기 `CLAUDE.md` 작성 |
| 2026-07-06 | 결정 필요 항목 4개 확정 (위 목록 참고) |
| 2026-07-06 | v1 전체 구현: Vite+React+Firebase 스캐폴딩, Firestore 데이터 레이어·보안 규칙, "오늘의 운동" 화면(기기 프로필/체크·메모/진행률 링/스트릭/축하 연출/과거 날짜), "기록 보기" 대시보드(구글 로그인/프로필 전환/일·주·월·분기·년 탭/통계 카드/메모 모아보기), 알림 설정 화면 + FCM + Cloud Functions 스케줄 발송. PR #1로 main 병합 (커밋 `972c03e`). 빌드 확인 완료(`npm run build`) |
| 2026-07-06 | `CLAUDE.md` 전체 교체 (프로젝트 전용 규칙 A + 일반 지침 B 구조) |
| 2026-07-06 | GitHub Pages 사이트가 빈 화면인 원인 조사(gh-pages 브랜치 미존재 확인) → Firebase 프로젝트(`chairexercise-bfd03`) 신규 생성 및 `.env` 값 채움 → 빌드 확인(`npm run build`) → `npm run deploy`로 GitHub Pages 최초 배포 완료 (타 프로젝트 MyAssetDashBD/Pension-tracer 영향 없음) |
| 2026-07-06 | 배포 후 "불러오는 중..." 무한 로딩 디버깅: Firebase Auth 미설정(`auth/configuration-not-found`) → Firestore Database 미생성(`client is offline`) → 보안 규칙 버그 2건(익명 기기의 records 읽기 누락, profiles 최초 등록 부트스트랩 차단) 순차 발견·수정. 콘솔에 Firestore Database 생성 및 수정된 `firestore.rules` 배포 후 "오늘의 운동" 실사용 확인(프로필 선택 → 체크 → 진행률 반영) 완료 |

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

## 기능검증 시나리오
> 코드 변경이 영향을 준 메뉴는 완료 보고 전 아래 항목을 실제로 확인한다 (`CLAUDE.md` A-3). 새 기능 추가 시 해당 메뉴 항목에 시나리오를 추가한다.

### 오늘의 운동 (`/`)
1. 최초 접속(또는 "프로필 변경" 이후) 시 프로필 선택 화면(아버지/어머니)이 뜬다.
2. 프로필 선택 후 오늘 날짜의 운동 8개 목록과 진행률 0/8(또는 저장된 값)이 표시된다.
3. 운동 체크박스를 누르면 진행률이 즉시 올라가고, Firestore에 저장된다 (새로고침해도 유지).
4. 8개 모두 체크하면 축하 연출(CelebrationStamp)이 뜬다.
5. "+ 메모 추가"로 메모를 입력하면 저장되고 새로고침해도 유지된다.
6. 날짜 입력을 과거 날짜로 바꾸면 해당 날짜 기록이 표시되고 "과거 날짜 수정 중" 문구가 뜬다. 오늘 날짜로 되돌리면 문구가 사라진다.
7. "프로필 변경" 클릭 시 프로필 선택 화면으로 돌아간다.
8. 스트릭 배지(연속 기록일)가 최근 기록에 맞게 표시된다.

### 기록 보기 (`/dashboard`)
1. 로그인 전에는 "Google 로그인" 버튼만 보인다.
2. Google 로그인 버튼 클릭 시 팝업이 정상적으로 뜨고 완료된다 (`auth/unauthorized-domain` 등 에러 없어야 함 — 배포 도메인이 Authorized domains에 등록돼 있어야 함).
3. 로그인한 계정에 `users/{uid}.allowedProfiles`가 없으면 "열람 권한이 없습니다" 안내와 로그아웃 버튼만 보인다.
4. 권한이 있으면 `allowedProfiles`에 포함된 프로필 버튼만 노출되고, 첫 번째 프로필이 기본 선택된다.
5. 일/주/월/분기/년 탭 전환 시 각각 DayView/WeekView/MonthHeatmap/PeriodBarChart가 정상 렌더링된다.
6. 상단 통계 카드(연속 기록일/최장 스트릭/총 참여일/총 완료일/평균 완료율)가 탭 전환에 따라 갱신된다.
7. 월 탭에서 히트맵의 날짜를 클릭하면 "일" 탭으로 전환되며 해당 날짜가 선택된다.
8. "최근 메모" 목록이 실제 저장된 메모와 일치한다.
9. 로그아웃 클릭 시 다시 로그인 화면으로 돌아간다.

### 설정 (`/settings`)
1. 기기 프로필이 선택되지 않은 상태로 접속하면 "먼저 오늘의 운동 화면에서 기기 프로필을 선택해주세요" 안내만 뜬다.
2. 프로필 선택 상태에서는 저장된 알림 시간(없으면 기본값 20:00)이 표시된다.
3. 알림 시간을 변경하면 Firestore에 저장되고, 새로고침해도 유지된다.
4. "이 기기에서 알림 받기" 클릭 시 브라우저 알림 권한 요청이 뜬다.
   - 허용 시 "알림이 활성화되었습니다" 표시, FCM 토큰이 `profiles/{profileId}.fcmTokens`에 등록된다.
   - 거부 시 "알림 권한이 거부되었습니다..." 표시.
   - 미지원 브라우저면 "이 브라우저는 알림을 지원하지 않습니다" 표시.

## 참고 문서
- `chair-exercise-tracker-spec.md` — 기획 원본 스펙
- `context-notes.md` — v1 구현 중 세부 결정과 근거 (append-only)
- `checklist.md` — v1 구현 세부 체크리스트 (완료 상태 기록용, 이후 신규 작업은 본 PLAN.md의 "남은 작업"으로 관리)
