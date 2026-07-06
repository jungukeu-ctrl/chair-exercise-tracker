const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

function currentKstTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

// 15분 간격으로 실행되며, 현재 시각(KST)이 notificationTime과 일치하는 프로필에게 리마인드 푸시 발송
exports.sendExerciseReminders = onSchedule(
  { schedule: "*/15 * * * *", timeZone: "Asia/Seoul" },
  async () => {
    const nowHm = currentKstTime();
    const db = getFirestore();
    const snap = await db
      .collection("profiles")
      .where("notificationTime", "==", nowHm)
      .get();

    if (snap.empty) return;

    const messaging = getMessaging();
    for (const doc of snap.docs) {
      const tokens = doc.data().fcmTokens;
      if (!tokens || tokens.length === 0) continue;
      await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: "의자운동 다이어리",
          body: "오늘의 의자운동, 아직 안 하셨다면 지금 시작해보세요!",
        },
      });
    }
  }
);
