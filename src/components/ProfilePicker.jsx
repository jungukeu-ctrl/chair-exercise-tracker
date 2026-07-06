// 최초 진입 시 / 프로필 변경 시 "이 기기는 누구 것인가요?" 선택 UI
import { PROFILES } from "../constants/exercises";

export default function ProfilePicker({ onSelect }) {
  return (
    <div className="profile-picker">
      <h2>이 기기는 누구 것인가요?</h2>
      <div className="profile-options">
        {PROFILES.map((p) => (
          <button key={p.id} onClick={() => onSelect(p.id)}>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
