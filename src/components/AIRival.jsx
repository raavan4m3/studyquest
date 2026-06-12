import { useState, useEffect } from 'react';

const MOTIVATIONAL = [
  "You can do it!",
  "Every minute counts!",
  "Stay focused!",
  "You've got this!",
  "Small steps lead to big results.",
  "Keep pushing forward!",
  "Your future self will thank you.",
  "Consistency is key.",
  "One session at a time.",
  "You're building something great.",
];

export default function AIRival({ compact }) {
  const [message, setMessage] = useState(() =>
    MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="rival-thought command-panel">
        <div className="command-panel-title">System Message</div>
        <div className="rival-thought-header">
          <span className="rival-thought-icon">💡</span>
          <span className="rival-thought-label">motivation</span>
        </div>
        <div className="rival-thought-message">"{message}"</div>
      </div>
    );
  }

  return null;
}
