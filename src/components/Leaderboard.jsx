import { useState } from 'react';
import { useGame } from '../store/GameContext';

const MOCK_USERS = [
  { name: 'StudyMaster', xp: 15000, level: 10, streak: 45 },
  { name: 'FocusKing', xp: 12000, level: 9, streak: 30 },
  { name: 'ZenStudent', xp: 8000, level: 7, streak: 21 },
  { name: 'TaskSlayer', xp: 6000, level: 6, streak: 15 },
  { name: 'ProductivityPro', xp: 4000, level: 5, streak: 10 },
  { name: 'LearningMachine', xp: 2500, level: 4, streak: 7 },
  { name: 'ConsistentOne', xp: 1500, level: 3, streak: 5 },
  { name: 'NewFocus', xp: 500, level: 2, streak: 2 },
];

export default function Leaderboard() {
  const { xp, level, streak, name } = useGame();
  const [tab, setTab] = useState('global');

  const allUsers = [
    { name: name || 'You', xp: xp, level: level, streak: streak, isYou: true },
    ...MOCK_USERS,
  ].sort((a, b) => b.xp - a.xp);

  const rank = allUsers.findIndex(u => u.isYou) + 1;

  return (
    <div className="leaderboard panel-border">
      <div className="leaderboard-tabs">
        {['global', 'weekly', 'friends'].map(t => (
          <button key={t} className={`lb-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="leaderboard-list">
        {allUsers.slice(0, 15).map((user, i) => (
          <div key={user.name} className={`lb-entry ${user.isYou ? 'you' : ''} ${i < 3 ? 'top' : ''}`}>
            <span className={`lb-rank ${i < 3 ? 'medal' : ''}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            <span className="lb-name">{user.isYou ? '⭐ You' : user.name}</span>
            <span className="lb-level">Lv.{user.level}</span>
            <span className="lb-xp">{user.xp.toLocaleString()} XP</span>
            <span className="lb-streak">🔥 {user.streak}d</span>
          </div>
        ))}
      </div>
      {rank > 0 && (
        <div className="lb-your-rank">
          You're #{rank} on the leaderboard
        </div>
      )}
    </div>
  );
}
