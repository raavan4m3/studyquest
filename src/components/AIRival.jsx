import { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { AI_RIVALS, getRivalMessage } from '../data/aiRivals';

export default function AIRival() {
  const { totalStudySeconds } = useGame();
  const [rival] = useState(() => AI_RIVALS[Math.floor(Math.random() * AI_RIVALS.length)]);
  const [rivalSeconds, setRivalSeconds] = useState(0);
  const [message, setMessage] = useState('');
  const [encouragement, setEncouragement] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setRivalSeconds(prev => prev + 1 + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const msg = getRivalMessage(rival.id, totalStudySeconds, rivalSeconds);
    setMessage(msg);
  }, [totalStudySeconds, rivalSeconds, rival.id]);

  useEffect(() => {
    const encouragementInterval = setInterval(() => {
      const msg = getRivalMessage(rival.id, totalStudySeconds, rivalSeconds, 'encouragement');
      setEncouragement(msg);
    }, 15000);
    return () => clearInterval(encouragementInterval);
  }, [totalStudySeconds, rivalSeconds, rival.id]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="ai-rival-card" style={{ borderColor: rival.color + '40' }}>
      <div className="rival-header">
        <span className="rival-icon">{rival.icon}</span>
        <span className="rival-name" style={{ color: rival.color }}>{rival.name}</span>
      </div>
      <div className="rival-comparison">
        <div className="rival-stat">
          <span className="rival-stat-label">{rival.name}</span>
          <span className="rival-stat-value">{formatTime(rivalSeconds)}</span>
        </div>
        <div className="rival-vs">VS</div>
        <div className="rival-stat you">
          <span className="rival-stat-label">You</span>
          <span className="rival-stat-value">{formatTime(totalStudySeconds)}</span>
        </div>
      </div>
      <div className="rival-message">{message}</div>
      {encouragement && <div className="rival-encouragement">💬 {encouragement}</div>}
    </div>
  );
}
