#!/usr/bin/env node
// 빌드 전 .env 필수 키 존재 여부를 검증 (누락 시 빌드 실패)
import { existsSync, readFileSync } from "node:fs";

const REQUIRED_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

// 없어도 빌드는 가능하지만 없으면 동작하지 않는 기능이 있는 키 (하드 실패시키지 않고 경고만)
const RECOMMENDED_KEYS = ["VITE_FIREBASE_VAPID_KEY"];

function loadDotEnv(path) {
  if (!existsSync(path)) return {};
  const result = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return result;
}

const fileEnv = loadDotEnv(".env");
const missing = REQUIRED_KEYS.filter((key) => !(process.env[key] || fileEnv[key]));

if (missing.length > 0) {
  console.error(
    `빌드 실패: .env에 다음 필수 키 값이 없습니다 — ${missing.join(", ")}\n` +
      `.env.example을 참고해 .env 파일에 값을 채워주세요.`
  );
  process.exit(1);
}

console.log("환경변수 확인 완료 (필수 키 모두 존재)");

const missingRecommended = RECOMMENDED_KEYS.filter((key) => !(process.env[key] || fileEnv[key]));
if (missingRecommended.length > 0) {
  console.warn(
    `경고: 다음 키가 비어있습니다 — ${missingRecommended.join(", ")}\n` +
      `빌드는 계속 진행되지만, 관련 기능(FCM 푸시 알림)은 동작하지 않습니다.`
  );
}
