// 폰 여부를 판별해 "오늘의 운동" 화면의 PC/태블릿 접근 안내에 사용하는 유틸
export function isMobileDevice() {
  if (typeof navigator === "undefined") return true;
  if (navigator.userAgentData) return navigator.userAgentData.mobile;
  return /Mobile/.test(navigator.userAgent);
}
