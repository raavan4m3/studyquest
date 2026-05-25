import { useEffect, useRef } from 'react';

export default function RewardPopup({ reward, onComplete }) {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!reward) return;
    const timer = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(timer);
  }, [reward, onComplete]);

  if (!reward || (!reward.xp && !reward.coins)) return null;

  return (
    <div className="reward-popup-overlay">
      <div className="reward-popup" ref={popupRef}>
        <div className="reward-glow" />
        <div className="reward-content">
          {reward.xp > 0 && <div className="reward-xp">+{reward.xp} XP</div>}
          {reward.coins > 0 && <div className="reward-coins">+{reward.coins} 🪙</div>}
        </div>
      </div>
    </div>
  );
}
