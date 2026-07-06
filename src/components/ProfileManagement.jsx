// 자녀 계정 전용 프로필 관리 (기기 등록 초기화 / 기록 데이터 초기화)
import { useState } from "react";
import { PROFILES } from "../constants/exercises";
import { resetDeviceUids } from "../lib/profiles";
import { deleteAllDaysForProfile } from "../lib/records";

export default function ProfileManagement({ onRecordsDeleted }) {
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmName, setConfirmName] = useState("");

  async function handleResetDevices(profile) {
    if (
      !window.confirm(
        `정말 초기화하시겠습니까? "${profile.name}" 프로필로 등록된 기기가 모두 해제됩니다.`
      )
    ) {
      return;
    }
    setBusyId(profile.id);
    try {
      await resetDeviceUids(profile.id);
      window.alert(`"${profile.name}"의 기기 등록이 초기화되었습니다.`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    const profile = deleteTarget;
    if (confirmName !== profile.name) return;
    setBusyId(profile.id);
    try {
      await deleteAllDaysForProfile(profile.id);
      onRecordsDeleted?.(profile.id);
      window.alert(`"${profile.name}"의 모든 운동 기록이 삭제되었습니다.`);
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
      setConfirmName("");
    }
  }

  return (
    <section className="profile-management">
      <h2>프로필 관리</h2>
      {PROFILES.map((profile) => (
        <div key={profile.id} className="profile-management-row">
          <span className="profile-management-name">{profile.name}</span>
          <button disabled={busyId === profile.id} onClick={() => handleResetDevices(profile)}>
            기기 등록 초기화
          </button>
          <button
            className="danger"
            disabled={busyId === profile.id}
            onClick={() => {
              setDeleteTarget(profile);
              setConfirmName("");
            }}
          >
            기록 데이터 초기화
          </button>
        </div>
      ))}

      {deleteTarget && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <p>
              정말 삭제하시겠습니까? "{deleteTarget.name}"의 모든 운동 기록이 영구히 삭제되며
              되돌릴 수 없습니다.
            </p>
            <p>
              계속하려면 아래에 <strong>{deleteTarget.name}</strong>을(를) 입력하세요.
            </p>
            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={deleteTarget.name}
            />
            <div className="modal-actions">
              <button onClick={() => setDeleteTarget(null)}>취소</button>
              <button
                className="danger"
                disabled={confirmName !== deleteTarget.name || busyId === deleteTarget.id}
                onClick={handleConfirmDelete}
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
