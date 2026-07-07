// firestore.rules 검증: 신규 프로필의 기기 자가등록이 완료되기 전에는 records 읽기가
// 거부되고, 등록(registerDeviceForProfile과 동일한 setDoc)이 끝난 뒤에는 즉시 성공하는지 확인
// (TodayExercise.jsx / useDeviceProfile.js의 "등록 완료 후에만 읽기" 순서 보장 전제)
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

const PROJECT_ID = "chair-exercise-tracker-test-init-order";
let testEnv;
let failures = 0;

function check(name, condition) {
  if (condition) {
    console.log(`ok - ${name}`);
  } else {
    console.error(`FAIL - ${name}`);
    failures++;
  }
}

async function withoutRules(fn) {
  let result;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    result = await fn(ctx.firestore());
  });
  return result;
}

async function main() {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });

  await testEnv.clearFirestore();
  await withoutRules(async (db) => {
    await setDoc(doc(db, "records", "father", "days", "2026-07-01"), { exercises: {}, completedCount: 3 });
  });

  const newDeviceUid = "brand-new-device-uid";
  const db = testEnv.authenticatedContext(newDeviceUid).firestore();

  // 등록 전: 아직 deviceUids에 없으므로 records 읽기는 거부되어야 함
  await assertFails(getDocs(collection(db, "records", "father", "days")));
  check("등록 전 신규 기기는 records 읽기 거부됨", true);

  // registerDeviceForProfile과 동일한 자가등록 write
  await assertSucceeds(
    setDoc(doc(db, "profiles", "father"), { name: "father", deviceUids: arrayUnion(newDeviceUid) }, { merge: true })
  );

  // 등록 완료 후: 같은 기기로 즉시 읽기 성공해야 함 (새로고침 없이 바로 열었을 때 시나리오)
  const days = await assertSucceeds(getDocs(collection(db, "records", "father", "days")));
  check("등록 완료 후 새로고침 없이 바로 읽으면 성공", days.size === 1);

  await testEnv.cleanup();

  if (failures > 0) {
    console.error(`\n${failures}개 시나리오 실패`);
    process.exit(1);
  }
  console.log("\n모든 시나리오 통과");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
