import { useGame } from '../store/GameContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

function buildWeekData(history) {
  const map = {};
  (history || []).forEach(d => { map[d.date] = d; });
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = map[key] || { studySeconds: 0, xpEarned: 0, tasksDone: 0 };
    result.push({ day: DAYS[d.getDay()], hours: +(entry.studySeconds / 3600).toFixed(1), tasks: entry.tasksDone, xp: entry.xpEarned });
  }
  return result;
}

function buildXpData(history) {
  const sorted = (history || []).filter(d => d.xpEarned > 0).sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;
  return sorted.map(d => {
    cumulative += d.xpEarned;
    return { day: d.date.slice(5), xp: cumulative };
  });
}

export default function StatisticsDashboard() {
  const { totalStudySeconds, todayStudySeconds, tasksCompleted, sessionsCompleted, xp, level, coins, streak, statsHistory } = useGame();

  const weekData = buildWeekData(statsHistory);
  const xpData = buildXpData(statsHistory);

  const stats = [
    { label: 'XP', value: xp.toLocaleString(), icon: '✨' },
    { label: 'Level', value: level, icon: '⭐' },
    { label: 'Coins', value: coins.toLocaleString(), icon: '🪙' },
    { label: 'Sessions', value: sessionsCompleted, icon: '🎯' },
    { label: 'Total Time', value: formatTime(totalStudySeconds), icon: '⏱️' },
    { label: 'Today', value: formatTime(todayStudySeconds), icon: '📅' },
    { label: 'Tasks Done', value: tasksCompleted, icon: '✅' },
    { label: 'Streak', value: `${streak}d`, icon: '🔥' },
  ];

  return (
    <div className="stats-dashboard panel-border">
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="stats-charts">
        <div className="chart-card">
          <h3>Weekly Study Hours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#8888aa" fontSize={12} />
              <YAxis stroke="#8888aa" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="hours" stroke="#6c5ce7" fill="url(#colorHours)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>XP Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={xpData.length > 0 ? xpData : [{ day: '-', xp: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#8888aa" fontSize={12} />
              <YAxis stroke="#8888aa" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="xp" stroke="#a29bfe" strokeWidth={2} dot={{ fill: '#a29bfe', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Weekly Tasks</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#8888aa" fontSize={12} />
              <YAxis stroke="#8888aa" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="tasks" fill="#00b894" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
