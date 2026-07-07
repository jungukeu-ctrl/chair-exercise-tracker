// 운동 1개 카드: 이름/목적/목표 + 체크 버튼 + 메모 입력
import { useState } from "react";
import { VIDEO_URL } from "../constants/exercises";

export default function ExerciseCard({ exercise, done, memo, onToggle, onMemoChange, disabled }) {
  const [memoDraft, setMemoDraft] = useState(memo || "");
  const [editingMemo, setEditingMemo] = useState(false);

  function saveMemo() {
    setEditingMemo(false);
    if (memoDraft !== (memo || "")) {
      onMemoChange(memoDraft);
    }
  }

  return (
    <div className={`exercise-card ${done ? "done" : ""}`}>
      <div className="exercise-card-header">
        <div>
          <h3>{exercise.name}</h3>
          <p className="purpose">{exercise.purpose}</p>
          <p className="goal">목표: {exercise.goal}</p>
          <a
            className="video-link"
            href={`${VIDEO_URL}?t=${exercise.videoTimestampSec}s`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ▶ 영상 보기
          </a>
        </div>
        <button
          className="check-button"
          onClick={() => onToggle(!done)}
          aria-pressed={done}
          disabled={disabled}
        >
          {done ? "✅" : "⬜"}
        </button>
      </div>
      {editingMemo ? (
        <div className="memo-edit">
          <textarea
            value={memoDraft}
            onChange={(e) => setMemoDraft(e.target.value)}
            placeholder="메모 (예: 무릎이 좀 아팠음)"
          />
          <button onClick={saveMemo}>저장</button>
        </div>
      ) : (
        <button className="memo-display" onClick={() => setEditingMemo(true)}>
          {memo ? memo : "+ 메모 추가"}
        </button>
      )}
    </div>
  );
}
