import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

let notifyId = 0;
const listeners = new Set();

export function emitNotification(type, data) {
  const id = ++notifyId;
  listeners.forEach(fn => fn({ id, type, data, timestamp: Date.now() }));
}

export default function SystemNotification() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const handler = (n) => {
      setQueue(prev => [...prev, n]);
      const dur = n.type === 'LEVEL_UP' || n.type === 'RANK_UP' ? 5000 : 4000;
      setTimeout(() => setQueue(prev => prev.filter(x => x.id !== n.id)), dur);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return createPortal(
    <>
      {/* Corner notifications (XP_GAIN) */}
      <div className="sys-corner-container">
        {queue.filter(n => n.type === 'XP_GAIN' || n.type === 'LECTURE_COMPLETED').map(n => (
          <div key={n.id} className="sys-corner" style={{ '--c': '#00e5ff' }}>
            <div className="sys-corner-glow" />
            <div className="sys-corner-border" />
            <div className="sys-corner-inner">
              <span className="sys-corner-xp">+{n.data?.xp || 50} XP</span>
              <span className="sys-corner-label">{n.data?.label || 'Lecture Completed'}</span>
            </div>
            <div className="sys-corner-sparks" />
          </div>
        ))}
      </div>

      {/* Center panels (QUEST_COMPLETED, SUBJECT_MASTERED, DAILY_MISSION) */}
      {queue.filter(n => n.type === 'QUEST_COMPLETED' || n.type === 'SUBJECT_MASTERED' || n.type === 'DAILY_MISSION').map(n => {
        const isQuest = n.type === 'QUEST_COMPLETED';
        const isSubject = n.type === 'SUBJECT_MASTERED';
        const isDaily = n.type === 'DAILY_MISSION';
        return (
          <div key={n.id} className="sys-overlay">
            <div className="sys-center-panel" style={{ '--c': isQuest ? '#00e5ff' : isSubject ? '#ffd740' : '#7c4dff' }}>
              <div className="sys-center-scan" />
              <div className="sys-center-glow-ring" />
              <div className="sys-center-header">
                {isQuest && <><span className="sys-center-icon">⚡</span><span className="sys-center-title">QUEST COMPLETED</span></>}
                {isSubject && <><span className="sys-center-icon">📖</span><span className="sys-center-title">SUBJECT MASTERED</span></>}
                {isDaily && <><span className="sys-center-icon">📋</span><span className="sys-center-title">DAILY MISSION COMPLETE</span></>}
              </div>
              {n.data?.task && <div className="sys-center-task">Task: {n.data.task}</div>}
              <div className="sys-center-rewards">
                {n.data?.rewards?.map((r, i) => <div key={i} className="sys-center-reward">{r}</div>)}
              </div>
              {n.data?.badge && <div className="sys-center-badge">{n.data.badge}</div>}
              <div className="sys-center-progress-bar">
                <div className="sys-center-progress-fill" style={{ width: `${n.data?.progress || 0}%` }} />
              </div>
              <div className="sys-center-particles">
                {Array.from({ length: 12 }).map((_, i) => <div key={i} className="sys-particle" style={{ '--i': i, '--x': `${Math.random() * 100}%`, '--d': `${Math.random() * 2}s` }} />)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Full-screen (LEVEL_UP, RANK_UP) */}
      {queue.filter(n => n.type === 'LEVEL_UP' || n.type === 'RANK_UP').map(n => {
        const isRank = n.type === 'RANK_UP';
        return (
          <div key={n.id} className="sys-fullscreen-overlay">
            <div className="sys-fullscreen-bg" />
            <div className="sys-fullscreen-panel" style={{ '--c': isRank ? '#ffd700' : '#00e676' }}>
              {/* Code rain */}
              <div className="sys-code-rain">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="sys-code-column" style={{ '--i': i, '--s': `${1 + Math.random() * 2}s`, '--d': `${Math.random() * 3}s` }}>
                    {Array.from({ length: 8 }).map((_, j) => <span key={j}>{'010101'[Math.floor(Math.random() * 6)]}</span>)}
                  </div>
                ))}
              </div>
              {/* Main panel */}
              <div className="sys-fullscreen-main">
                <div className="sys-fullscreen-glow" />
                <div className="sys-fullscreen-border-tl" />
                <div className="sys-fullscreen-border-tr" />
                <div className="sys-fullscreen-border-bl" />
                <div className="sys-fullscreen-border-br" />
                <div className="sys-fullscreen-title">{isRank ? 'RANK UP' : 'LEVEL UP!'}</div>
                {isRank && n.data?.oldRank && n.data?.newRank && (
                  <div className="sys-fullscreen-rank">{n.data.oldRank} → {n.data.newRank}</div>
                )}
                {!isRank && n.data?.oldLevel !== undefined && n.data?.newLevel !== undefined && (
                  <div className="sys-fullscreen-level">Level {n.data.oldLevel} → {n.data.newLevel}</div>
                )}
                <div className="sys-fullscreen-stats">
                  {n.data?.rewards?.map((r, i) => <div key={i} className="sys-fullscreen-stat">{r}</div>)}
                </div>
              </div>
              {/* Particle explosion */}
              <div className="sys-fullscreen-particles">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="sys-fp" style={{ '--i': i, '--x': `${Math.random() * 200 - 100}px`, '--y': `${Math.random() * 200 - 100}px`, '--s': `${0.5 + Math.random() * 1}s` }} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>,
    document.body
  );
}
