import { useGame } from '../store/GameContext';
import { ACHIEVEMENTS } from '../utils/achievements';

export default function AchievementSystem() {
  const { achievements } = useGame();
  return (
    <div className="achievement-grid">
      {ACHIEVEMENTS.map(a => {
        const unlocked = achievements.includes(a.id);
        return (
          <div key={a.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">{unlocked ? a.icon : '🔒'}</div>
            <div className="achievement-info">
              <span className="achievement-name">{a.name}</span>
              <span className="achievement-desc">{a.desc}</span>
            </div>
            {unlocked && (
              <div className="achievement-reward">
                <span>+{a.xp} XP</span>
                <span>+{a.coins} 🪙</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
