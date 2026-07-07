// firestore.rules 검증: 자녀 계정의 "기기 등록 초기화"와 "기록 데이터 초기화"가
// 서로 독립적으로 동작하고, 의도한 문서 외에는 건드리지 않는지 에뮬레이터로 확인
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

const PROJECT_ID = "chair-exercise-tracker-test";
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

// 기본 데이터: father/mother 프로필(기기 등록됨), 각각 기록 2건/1건, 자녀 계정(둘 다 열람 권한)
async function seedDefault() {
  await withoutRules(async (db) => {
    await setDoc(doc(db, "profiles", "father"), { name: "father", deviceUids: ["father-device-uid"] });
    await setDoc(doc(db, "profiles", "mother"), { name: "mother", deviceUids: ["mother-device-uid"] });
    await setDoc(doc(db, "users", "child-uid"), { role: "child", allowedProfiles: ["father", "mother"] });
    await setDoc(doc(db, "records", "father", "days", "2026-07-01"), { exercises: {}, completedCount: 3 });
    await setDoc(doc(db, "records", "father", "days", "2026-07-02"), { exercises: {}, completedCount: 5 });
    await setDoc(doc(db, "records", "mother", "days", "2026-07-01"), { exercises: {}, completedCount: 8 });
  });
}

async function reset() {
  await testEnv.clearFirestore();
  await seedDefault();
}

async function main() {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });

  // 시나리오 1: 자녀가 father 기기 등록만 초기화 → deviceUids만 비고, records/mother는 그대로
  await reset();
  {
    const db = testEnv.authenticatedContext("child-uid").firestore();
    await assertSucceeds(setDoc(doc(db, "profiles", "father"), { deviceUids: [] }, { merge: true }));

    const father = (await withoutRules((d) => getDoc(doc(d, "profiles", "father")))).data();
    check("기기 초기화 후 father.deviceUids === []", JSON.stringify(father.deviceUids) === "[]");

    const mother = (await withoutRules((d) => getDoc(doc(d, "profiles", "mother")))).data();
    check(
      "father 기기 초기화가 mother.deviceUids에 영향 없음",
      JSON.stringify(mother.deviceUids) === JSON.stringify(["mother-device-uid"])
    );

    const fatherDays = await withoutRules((d) => getDocs(collection(d, "records", "father", "days")));
    check("father 기기 초기화가 records를 건드리지 않음 (2건 유지)", fatherDays.size === 2);
  }

  // 시나리오 2: 자녀가 father 기록만 삭제 → father.deviceUids는 유지, mother records는 그대로
  await reset();
  {
    const db = testEnv.authenticatedContext("child-uid").firestore();
    await assertSucceeds(deleteDoc(doc(db, "records", "father", "days", "2026-07-01")));
    await assertSucceeds(deleteDoc(doc(db, "records", "father", "days", "2026-07-02")));

    const fatherDays = await withoutRules((d) => getDocs(collection(d, "records", "father", "days")));
    check("father records 삭제 후 0건", fatherDays.size === 0);

    const motherDays = await withoutRules((d) => getDocs(collection(d, "records", "mother", "days")));
    check("father records 삭제가 mother records에 영향 없음 (1건 유지)", motherDays.size === 1);

    const father = (await withoutRules((d) => getDoc(doc(d, "profiles", "father")))).data();
    check(
      "father records 삭제가 father.deviceUids에 영향 없음",
      JSON.stringify(father.deviceUids) === JSON.stringify(["father-device-uid"])
    );
  }

  // 시나리오 3: deviceUids 초기화 시 다른 필드(name)를 같이 바꾸려 하면 거부
  await reset();
  {
    const db = testEnv.authenticatedContext("child-uid").firestore();
    await assertFails(
      setDoc(doc(db, "profiles", "father"), { deviceUids: [], name: "hacked" }, { merge: true })
    );
  }
  check("deviceUids 초기화와 함께 다른 필드 변경 시 거부됨", true);

  // 시나리오 4: deviceUids를 빈 배열이 아닌 임의 값으로 바꾸려 하면 거부 (초기화 전용)
  await reset();
  {
    const db = testEnv.authenticatedContext("child-uid").firestore();
    await assertFails(
      setDoc(doc(db, "profiles", "father"), { deviceUids: ["arbitrary-uid"] }, { merge: true })
    );
  }
  check("deviceUids를 임의 값으로 덮어쓰기는 거부됨", true);

  // 시나리오 5: allowedProfiles에 없는 프로필은 자녀도 조작 불가
  await reset();
  await withoutRules((db) => setDoc(doc(db, "users", "father-only-child"), { role: "child", allowedProfiles: ["father"] }));
  {
    const db = testEnv.authenticatedContext("father-only-child").firestore();
    await assertFails(setDoc(doc(db, "profiles", "mother"), { deviceUids: [] }, { merge: true }));
    await assertFails(deleteDoc(doc(db, "records", "mother", "days", "2026-07-01")));
  }
  check("allowedProfiles에 없는 프로필은 자녀도 초기화/삭제 불가", true);

  // 시나리오 6: role이 child가 아니면(예: parent) 두 동작 모두 불가
  await reset();
  await withoutRules((db) => setDoc(doc(db, "users", "parent-uid"), { role: "parent", allowedProfiles: ["father"] }));
  {
    const db = testEnv.authenticatedContext("parent-uid").firestore();
    await assertFails(setDoc(doc(db, "profiles", "father"), { deviceUids: [] }, { merge: true }));
    await assertFails(deleteDoc(doc(db, "records", "father", "days", "2026-07-01")));
  }
  check("role이 child가 아니면 기기 초기화/기록 삭제 모두 불가", true);

  // 시나리오 7 (회귀): 기존 부모 기기(anonymous auth uid)는 기존처럼 정상 동작
  await reset();
  {
    const db = testEnv.authenticatedContext("father-device-uid").firestore();
    await assertSucceeds(
      setDoc(doc(db, "records", "father", "days", "2026-07-03"), { exercises: {}, completedCount: 1 })
    );
  }
  check("기존 등록된 부모 기기의 records 쓰기 회귀 없음", true);

  // 시나리오 8 (회귀): Firebase 콘솔에서 수동 생성해 deviceUids 필드가 아예 없는 profiles 문서에도
  // 신규 기기 자가등록이 평가 오류 없이 정상 동작해야 함
  await testEnv.clearFirestore();
  await withoutRules((db) => setDoc(doc(db, "profiles", "father"), { name: "father" }));
  {
    const db = testEnv.authenticatedContext("new-device-uid").firestore();
    await assertSucceeds(
      setDoc(doc(db, "profiles", "father"), { name: "father", deviceUids: ["new-device-uid"] }, { merge: true })
    );
    const father = (await withoutRules((d) => getDoc(doc(d, "profiles", "father")))).data();
    check(
      "deviceUids 필드 없는 문서에서도 신규 기기 자가등록 성공",
      JSON.stringify(father.deviceUids) === JSON.stringify(["new-device-uid"])
    );
  }

  // 시나리오 9 (회귀): allowedProfiles 필드가 없는 users 문서를 가진 자녀 계정도 평가 오류 없이 거부되어야 함
  await testEnv.clearFirestore();
  await withoutRules((db) => setDoc(doc(db, "users", "no-allowed-profiles-child"), { role: "child" }));
  {
    const db = testEnv.authenticatedContext("no-allowed-profiles-child").firestore();
    await assertFails(getDoc(doc(db, "profiles", "father")));
  }
  check("allowedProfiles 필드 없는 users 문서는 평가 오류 없이 접근 거부됨", true);

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
