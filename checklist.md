# Checklist — 의자운동 다이어리 v1

`chair-exercise-tracker-spec.md` + `context-notes.md`의 결정사항 기준. 완료한 항목은 체크하고 커밋합니다.

## 0. 문서
- [x] checklist.md, context-notes.md 작성

## 1. 프로젝트 셋업
- [x] Vite + React 스캐폴딩
- [x] Firebase SDK 초기화 (`src/firebase.js`, `.env.example`)
- [x] 라우팅 (오늘의 운동 / 대시보드 / 설정)
- [x] GitHub Pages 배포 설정 (vite base path, gh-pages 스크립트)

## 2. 데이터 레이어
- [x] 8개 운동 시드 데이터 상수 (`src/constants/exercises.js`)
- [x] Firestore 헬퍼 함수 (records read/write, profiles, users)
- [x] `firestore.rules` 작성 (Anonymous Auth 매핑 검증 포함)

## 3. 오늘의 운동 (기록 화면)
- [x] 최초 진입 시 기기 프로필 선택 UI → localStorage + Anonymous Auth 매핑
- [x] 프로필 변경 옵션
- [x] 8개 운동 카드 (체크 + 메모, 언제든 수정 가능)
- [x] 오늘 진행률 도넛 링
- [x] 연속 완주일수(스트릭) 배지
- [x] 8/8 완료 축하 연출
- [x] 과거 날짜로 이동해 기록/메모 수정

## 4. 대시보드 (기록 보기)
- [x] Google 로그인
- [x] `users/{uid}.allowedProfiles` 기반 프로필 전환 UI
- [x] 일/주/월/분기/년 탭
- [x] 일: 8개 운동 체크 상태 + 메모 리스트
- [x] 주: 최근 7일 완료 개수 막대그래프
- [x] 월: 달력 히트맵
- [x] 분기/년: 월별 평균 완료 개수 막대그래프
- [x] 통계 카드 (현재 연속일수, 최장 연속일수, 총 참여일수, 총 완주일수, 평균 완료율)
- [x] 메모 모아보기

## 5. 알림 (설정 가능 시간)
- [x] `profiles/{profileId}`에 notificationTime, fcmTokens 필드
- [x] 설정 화면: 프로필별 알림 시간 변경 UI
- [x] FCM 클라이언트 등록 (`public/firebase-messaging-sw.js`, 토큰 저장)
- [x] Cloud Functions 스케줄 함수 (`functions/`) — 15분 간격 매칭 발송

## 6. 마무리
- [x] 빌드 확인 (`npm run build`)
- [x] README에 셋업/배포 방법 기록
- [x] Firebase 프로젝트 생성은 사용자 몫임을 명시

## v1 이후 남은 작업 (사용자 확인 필요)
- [ ] 실제 Firebase 프로젝트 생성 및 `.env` 값 채우기 (본인 수행)
- [ ] Firestore 보안 규칙 실제 배포 후 에뮬레이터/실기기로 읽기·쓰기 권한 테스트
- [ ] Cloud Functions 배포 (Blaze 요금제 필요) 및 실제 푸시 수신 테스트
- [ ] 안드로이드 기기에서 실사용 테스트 (PWA 설치 없이 알림 수신 여부 등)
