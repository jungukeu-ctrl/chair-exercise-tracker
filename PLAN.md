# chair-exercise-tracker — PLAN

> 이 문서는 프로젝트의 유일한 진실 공급원(single source of truth)입니다.
> 매 세션 시작 시 Claude Code가 가장 먼저 읽습니다.

## 🔔 전략 세션 반영 필요
_(정책성 변경 발생 시 날짜와 함께 여기에 기록)_

- 2026-07-06: `CLAUDE.md` 전체 교체 — 프로젝트 전용 규칙(A: 코드작성 게이트, PLAN.md 중심 운영, DO/CHECK/ACT 사이클, 브랜치·커밋 규칙, Firebase 데이터 분리) + 일반 행동 지침(B) 구조로 재편.

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
- [x] GitHub Pages 실제 배포 실행 (`npm run deploy`) — `gh-pages` 브랜치 생성 및 배포 완료
- [ ] 저장소 Settings > Pages에서 Source가 `gh-pages` 브랜치로 지정돼 있는지 확인 (최초 배포 시 수동 확인 필요할 수 있음)
- [ ] Firebase Auth 콘솔에서 Google 로그인 + Anonymous 로그인 활성화 (아직 미확인)
- [ ] Firestore 보안 규칙(`firestore.rules`) 실제 배포 및 시나리오별 테스트 (다른 기기가 다른 프로필 쓰기 시도 등)
- [ ] Cloud Functions(`functions/`) 배포 — Blaze(종량제) 요금제 필요
- [ ] 실기기 알림 수신 테스트 (안드로이드)
- [ ] `users/{자녀uid}.role = "child"` 수동 등록 (실제 배포 후)
- [ ] **[미해결, 결정 대기]** 기기 자가 등록(`registerDeviceForProfile`)이 보안 규칙상 구조적으로 항상 실패하는 문제 — 에뮬레이터로 재현 확인(아래 완료 로그 참고). 해결 방안 결정 필요: (a) `profiles` read 완화 + 자가등록 write만 허용하도록 규칙 개선, (b) 클라이언트 존재확인 read 제거 + write 규칙만 개선. 사용자 결정 대기 중.

## 완료된 작업
| 날짜 | 내용 |
|---|---|
| 2026-07-06 | 기획 스펙 문서(`chair-exercise-tracker-spec.md`) 및 초기 `CLAUDE.md` 작성 |
| 2026-07-06 | 결정 필요 항목 4개 확정 (위 목록 참고) |
| 2026-07-06 | v1 전체 구현: Vite+React+Firebase 스캐폴딩, Firestore 데이터 레이어·보안 규칙, "오늘의 운동" 화면(기기 프로필/체크·메모/진행률 링/스트릭/축하 연출/과거 날짜), "기록 보기" 대시보드(구글 로그인/프로필 전환/일·주·월·분기·년 탭/통계 카드/메모 모아보기), 알림 설정 화면 + FCM + Cloud Functions 스케줄 발송. PR #1로 main 병합 (커밋 `972c03e`). 빌드 확인 완료(`npm run build`) |
| 2026-07-06 | `CLAUDE.md` 전체 교체 (프로젝트 전용 규칙 A + 일반 지침 B 구조) |
| 2026-07-06 | GitHub Pages 사이트가 빈 화면인 원인 조사(gh-pages 브랜치 미존재 확인) → Firebase 프로젝트(`chairexercise-bfd03`) 신규 생성 및 `.env` 값 채움 → 빌드 확인(`npm run build`) → `npm run deploy`로 GitHub Pages 최초 배포 완료 (타 프로젝트 MyAssetDashBD/Pension-tracer 영향 없음) |
| 2026-07-06 | "어머니 선택 후 불러오는 중 멈춤" 버그 조사 → `firestore.rules`의 `records/{profileId}/days/{date}` 읽기 규칙에 `isDeviceOfProfile` 체크가 빠져있던 버그 발견·수정, `allowedProfiles`/`deviceUidsOf`를 `exists()` 가드로 안전하게 개선(존재하지 않는 문서 `get()` 시 예외 대신 빈 배열 반환). `TodayExercise.jsx`에 로딩 에러 상태 추가(무한 스피너 대신 에러 메시지 표시). Firestore 에뮬레이터(`@firebase/rules-unit-testing`)로 직접 재현·검증하는 과정에서 **더 근본적인 별도 문제 발견**: `registerDeviceForProfile()`의 존재확인 `getDoc()` 자체가 신규/기존 프로필 관계없이 항상 권한 거부되어 기기 자가등록이 구조적으로 항상 실패함(에뮬레이터로 실증). 이 문제는 A-6에서 결정된 "Anonymous Auth 기기 매핑" 방식의 보안 규칙 재설계가 필요해 사용자 결정 대기 중(위 남은 작업 참고). `npm run build` 통과 확인. 타 프로젝트 영향 없음 |

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
