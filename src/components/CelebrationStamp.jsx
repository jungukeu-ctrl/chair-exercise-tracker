// 8/8 완료 시 나타나는 축하 도장 연출
export default function CelebrationStamp({ show }) {
  if (!show) return null;
  return (
    <div className="celebration-stamp" role="status">
      <div className="stamp">완료 🎉</div>
    </div>
  );
}
