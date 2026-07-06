# Checklist — 의자운동 다이어리 v1

`chair-exercise-tracker-spec.md` + `context-notes.md`의 결정사항 기준. 완료한 항목은 체크하고 커밋합니다.

## 0. 문서
- [x] checklist.md, context-notes.md 작성

## 1. 프로젝트 셋업
- [ ] Vite + React 스캐폴딩
- [ ] Firebase SDK 초기화 (`src/firebase.js`, `.env.example`)
- [ ] 라우팅 (오늘의 운동 / 대시보드 / 설정)
- [ ] GitHub Pages 배포 설정 (vite base path, gh-pages 스크립트)

## 2. 데이터 레이어
- [ ] 8개 운동 시드 데이터 상수 (`src/constants/exercises.js`)
- [ ] Firestore 헬퍼 함수 (records read/write, profiles, users)
- [ ] `firestore.rules` 작성 (Anonymous Auth 매핑 검증 포함)

## 3. 오늘의 운동 (기록 화면)
- [ ] 최초 진입 시 기기 프로필 선택 UI → localStorage + Anonymous Auth 매핑
- [ ] 프로필 변경 옵션
- [ ] 8개 운동 카드 (체크 + 메모, 언제든 수정 가능)
- [ ] 오늘 진행률 도넛 링
- [ ] 연속 완주일수(스트릭) 배지
- [ ] 8/8 완료 축하 연출
- [ ] 과거 날짜로 이동해 기록/메모 수정

## 4. 대시보드 (기록 보기)
- [ ] Google 로그인
- [ ] `users/{uid}.allowedProfiles` 기반 프로필 전환 UI
- [ ] 일/주/월/분기/년 탭
- [ ] 일: 8개 운동 체크 상태 + 메모 리스트
- [ ] 주: 최근 7일 완료 개수 막대그래프
- [ ] 월: 달력 히트맵
- [ ] 분기/년: 월별 평균 완료 개수 막대그래프
- [ ] 통계 카드 (현재 연속일수, 최장 연속일수, 총 참여일수, 총 완주일수, 평균 완료율)
- [ ] 메모 모아보기

## 5. 알림 (설정 가능 시간)
- [ ] `profiles/{profileId}`에 notificationTime, fcmTokens 필드
- [ ] 설정 화면: 프로필별 알림 시간 변경 UI
- [ ] FCM 클라이언트 등록 (`public/firebase-messaging-sw.js`, 토큰 저장)
- [ ] Cloud Functions 스케줄 함수 (`functions/`) — 15분 간격 매칭 발송

## 6. 마무리
- [ ] 빌드 확인 (`npm run build`)
- [ ] README에 셋업/배포 방법 기록
- [ ] Firebase 프로젝트 생성은 사용자 몫임을 명시
