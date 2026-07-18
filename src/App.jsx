// 앱 라우팅 진입점: 오늘의 운동 / 기록 보기 / 설정
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import TodayExercise from "./pages/TodayExercise";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import "./App.css";

export default function App() {
  return (
    <HashRouter>
      <nav className="main-nav">
        <Link to="/">오늘의 운동</Link>
      </nav>
      <Routes>
        <Route path="/" element={<TodayExercise />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
}
