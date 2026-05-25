import { useGame } from '../store/GameContext';

export default function XPBar() {
  const { xp, level, levelProgress, coins } = useGame();
  const progress = levelProgress ? levelProgress.progress : 0;
  const current = levelProgress ? levelProgress.current : xp;
  const required = levelProgress ? levelProgress.required : xp;

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <span className="xp-level">Level {level}</span>
        <span className="xp-text">{current} / {required} XP</span>
      </div>
      <div className="xp-bar">
        <div className="xp-bar-fill" style={{ width: `${Math.min(progress * 100, 100)}%` }}>
          <div className="xp-bar-shine" />
        </div>
      </div>
      <div className="xp-bar-footer">
        <span className="xp-coins">🪙 {coins}</span>
      </div>
    </div>
  );
}
