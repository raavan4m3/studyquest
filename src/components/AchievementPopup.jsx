import { useEffect, useRef } from 'react';

export default function AchievementPopup({ achievement, onComplete }) {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, [achievement, onComplete]);

  if (!achievement) return null;

  return (
    <div className="achievement-popup-overlay">
      <div className="achievement-popup" ref={popupRef}>
        <div className="ach-popup-icon">🏆</div>
        <div className="ach-popup-title">Achievement Unlocked</div>
        <div className="ach-popup-name">{achievement.name}</div>
        <div className="ach-popup-rewards">
          <span>+{achievement.xp} XP</span>
          <span>+{achievement.coins} 🪙</span>
        </div>
      </div>
    </div>
  );
}
