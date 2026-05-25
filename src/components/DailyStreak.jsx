import { useGame } from '../store/GameContext';

export default function DailyStreak() {
  const { streak } = useGame();
  return (
    <div className="streak-badge">
      <span className="streak-fire">🔥</span>
      <span className="streak-count">{streak} Day Streak</span>
    </div>
  );
}
