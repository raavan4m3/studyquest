export const ACHIEVEMENTS = [
  { id: 'first_focus', name: 'First Focus', desc: 'Complete your first study session', xp: 100, coins: 50, icon: '🎯' },
  { id: 'task_slayer', name: 'Task Slayer', desc: 'Complete 10 tasks', xp: 100, coins: 50, icon: '⚔️' },
  { id: 'study_warrior', name: 'Study Warrior', desc: 'Study for 5 hours total', xp: 200, coins: 100, icon: '🛡️' },
  { id: 'productivity_master', name: 'Productivity Master', desc: 'Complete 50 tasks', xp: 500, coins: 250, icon: '👑' },
  { id: 'streak_7', name: 'Week Streak', desc: 'Maintain a 7-day streak', xp: 300, coins: 150, icon: '🔥' },
  { id: 'streak_30', name: 'Month Streak', desc: 'Maintain a 30-day streak', xp: 1000, coins: 500, icon: '💎' },
  { id: 'focus_master', name: 'Focus Master', desc: 'Complete 25 study sessions', xp: 500, coins: 200, icon: '⭐' },
  { id: 'coin_collector', name: 'Coin Collector', desc: 'Earn 1000 coins', xp: 300, coins: 200, icon: '🪙' },
  { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', xp: 500, coins: 300, icon: '🌟' },
];

export function checkAchievements(state, dispatch) {
  const unlocked = state.achievements || [];
  const newOnes = [];

  const checks = [
    { id: 'first_focus', cond: state.sessionsCompleted >= 1 },
    { id: 'task_slayer', cond: state.tasksCompleted >= 10 },
    { id: 'study_warrior', cond: state.totalStudySeconds >= 18000 },
    { id: 'productivity_master', cond: state.tasksCompleted >= 50 },
    { id: 'streak_7', cond: state.streak >= 7 },
    { id: 'streak_30', cond: state.streak >= 30 },
    { id: 'focus_master', cond: state.sessionsCompleted >= 25 },
    { id: 'coin_collector', cond: state.coins >= 1000 },
    { id: 'level_5', cond: state.level >= 5 },
  ];

  for (const check of checks) {
    if (!unlocked.includes(check.id) && check.cond) {
      const ach = ACHIEVEMENTS.find(a => a.id === check.id);
      if (ach) {
        newOnes.push(ach);
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { id: ach.id, name: ach.name, xp: ach.xp, coins: ach.coins } });
      }
    }
  }

  return newOnes;
}
