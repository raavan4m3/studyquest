import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const NOTIFICATION_TYPES = {
  LECTURE_COMPLETED: { title: 'LECTURE COMPLETED', color: '#7c4dff', icon: '📚' },
  QUEST_COMPLETED: { title: 'DAILY QUEST COMPLETED', color: '#00e5ff', icon: '⚡' },
  SKILL_UNLOCKED: { title: 'SKILL UNLOCKED', color: '#ffd740', icon: '🔓' },
  ACHIEVEMENT: { title: 'ACHIEVEMENT UNLOCKED', color: '#ff6d00', icon: '🏆' },
  RANK_UP: { title: 'RANK PROMOTION', color: '#ffd700', icon: '⬆' },
  LEVEL_UP: { title: 'LEVEL UP', color: '#00e676', icon: '⬆' },
};

let notifyId = 0;
const listeners = new Set();

export function emitNotification(type, lines) {
  const id = ++notifyId;
  listeners.forEach(fn => fn({ id, type, lines, timestamp: Date.now() }));
}

export default function SystemNotification() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const handler = (notification) => {
      setQueue(prev => [...prev, notification]);
      setTimeout(() => {
        setQueue(prev => prev.filter(n => n.id !== notification.id));
      }, 4000);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return createPortal(
    <div className="sys-notif-container">
      {queue.map(n => {
        const config = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.LECTURE_COMPLETED;
        return (
          <div key={n.id} className="sys-notif" style={{ '--notif-color': config.color }}>
            <div className="sys-notif-glow" />
            <div className="sys-notif-header">
              <span className="sys-notif-icon">{config.icon}</span>
              <span className="sys-notif-title">{config.title}</span>
            </div>
            <div className="sys-notif-lines">
              {n.lines.map((line, i) => (
                <div key={i} className="sys-notif-line">{line}</div>
              ))}
            </div>
            <div className="sys-notif-progress" />
          </div>
        );
      })}
    </div>,
    document.body
  );
}
