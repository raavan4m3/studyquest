import { useState } from 'react';
import { useGame } from '../store/GameContext';
import ThemeManager from './ThemeManager';
import AchievementSystem from './AchievementSystem';

export default function Settings({ onClose }) {
  const { timerHours, timerMinutes, timerSeconds, setTimer, tasksCompleted, sessionsCompleted, totalStudySeconds, xp, level, coins, streak } = useGame();
  const [tab, setTab] = useState('timer');
  const [hours, setHours] = useState(timerHours);
  const [minutes, setMinutes] = useState(timerMinutes);
  const [seconds, setSeconds] = useState(timerSeconds);

  const handleApply = () => {
    setTimer(Math.max(0, Math.min(99, Number(hours) || 0)), Math.max(0, Math.min(59, Number(minutes) || 0)), Math.max(0, Math.min(59, Number(seconds) || 0)));
  };

  const tabs = ['timer', 'themes', 'achievements', 'stats'];

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>
        <div className="settings-tabs">
          {tabs.map(t => (
            <button key={t} className={`st-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'timer' ? '⏱️ Timer' : t === 'themes' ? '🎨 Themes' : t === 'achievements' ? '🏆 Achievements' : '📊 Stats'}
            </button>
          ))}
        </div>
        <div className="settings-body">
          {tab === 'timer' && (
            <div className="timer-settings">
              <h3>Timer Settings</h3>
              <div className="timer-inputs">
                <div className="timer-input-group">
                  <label>Hours</label>
                  <input type="number" min="0" max="99" value={hours} onChange={e => setHours(e.target.value)} />
                </div>
                <div className="timer-input-group">
                  <label>Minutes</label>
                  <input type="number" min="0" max="59" value={minutes} onChange={e => setMinutes(e.target.value)} />
                </div>
                <div className="timer-input-group">
                  <label>Seconds</label>
                  <input type="number" min="0" max="59" value={seconds} onChange={e => setSeconds(e.target.value)} />
                </div>
              </div>
              <button className="apply-btn" onClick={handleApply}>Apply</button>
            </div>
          )}
          {tab === 'themes' && <ThemeManager />}
          {tab === 'achievements' && <AchievementSystem />}
          {tab === 'stats' && (
            <div className="stats-panel">
              <h3>Statistics</h3>
              <div className="stats-list">
                {[
                  ['XP', xp.toLocaleString(), '⭐'],
                  ['Level', level, '📈'],
                  ['Coins', coins.toLocaleString(), '🪙'],
                  ['Study Hours', (totalStudySeconds / 3600).toFixed(1), '📚'],
                  ['Tasks Completed', tasksCompleted, '✅'],
                  ['Sessions', sessionsCompleted, '⏱️'],
                  ['Current Streak', `${streak}d`, '🔥'],
                ].map(([label, value, icon]) => (
                  <div key={label} className="stats-row">
                    <span className="stats-row-icon">{icon}</span>
                    <span className="stats-row-label">{label}</span>
                    <span className="stats-row-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
