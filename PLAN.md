# chair-exercise-tracker — PLAN

> 이 문서는 프로젝트의 유일한 진실 공급원(single source of truth)입니다.
> 매 세션 시작 시 Claude Code가 가장 먼저 읽습니다.

## 🔔 전략 세션 반영 필요
_(정책성 변경 발생 시 날짜와 함께 여기에 기록)_

- (아직 없음)

## 현재 브랜치
- main (아직 개발 브랜치 없음 — 최초 세팅 시 개발 브랜치 생성 예정)

## 결정 필요 항목 (구현 전 확정 필요 — `CLAUDE.md` 6장 참고)
- [ ] 기록 화면 쓰기 인증 방식 (Anonymous Auth vs 기기 토큰)
- [ ] 자녀 계정 role 부여 방법 (수동 vs 초대 코드)
- [ ] 오프라인 대비 방식
- [ ] 알림 시간 커스터마이징 여부 (v1 고정 20:00 여부)

## 남은 작업 (To-Do)
- [ ] Firebase 신규 프로젝트 생성 (MyAssetDashBD/Pension-tracer와 분리)
- [ ] GitHub 저장소 생성 (`jungukeu-ctrl/chair-exercise-tracker`)
- [ ] Firestore 스키마 초기 세팅 (profiles / records / users)
- [ ] Firebase Auth 설정 (Google 로그인 + Anonymous Auth)
- [ ] "오늘의 운동" 화면 (기기별 고정 프로필, 8개 운동 체크+메모, 진행률 링, 스트릭, 완주 도장 연출)
- [ ] "기록 보기" 대시보드 (프로필 전환, 일/주/월/분기/년 탭, 통계 카드, 그래프/달력 히트맵, 메모 모아보기)
- [ ] FCM 매일 저녁 8시 알림
- [ ] Firestore 보안 규칙 작성 및 배포
- [ ] GitHub Pages 배포

## 완료된 작업
| 날짜 | 내용 |
|---|---|
| 2026-07-06 | 기획 스펙 문서(`chair-exercise-tracker-spec.md`) 및 `CLAUDE.md` 작성 완료 |

## 프로젝트 개요 — 데이터 모델 (요약)
> 상세는 `chair-exercise-tracker-spec.md` 5장 참고. 스키마 변경 시 이 섹션도 함께 갱신.

```
profiles/{profileId}          // "father" | "mother"
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
| 오늘의 운동 | 아버지/어머니 | 미구현 |
| 기록 보기(대시보드) | 아버지/어머니/자녀 | 미구현 |
