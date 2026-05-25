import { useEffect, useRef } from 'react';

export default function LevelUpPopup({ level, onComplete }) {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!level) return;
    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, [level, onComplete]);

  if (!level) return null;

  return (
    <div className="levelup-overlay">
      <div className="levelup-popup" ref={popupRef}>
        <div className="levelup-particle-burst" />
        <div className="levelup-icon">🎉</div>
        <h2 className="levelup-title">Level Up!</h2>
        <div className="levelup-level">Level {level}</div>
        <div className="levelup-reward">+{level * 50} 🪙 Bonus</div>
      </div>
    </div>
  );
}
