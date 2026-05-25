import { useGame } from '../store/GameContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const weeklyData = [
  { day: 'Mon', hours: 2, tasks: 5, xp: 150 },
  { day: 'Tue', hours: 3, tasks: 8, xp: 250 },
  { day: 'Wed', hours: 1.5, tasks: 3, xp: 100 },
  { day: 'Thu', hours: 4, tasks: 10, xp: 350 },
  { day: 'Fri', hours: 2.5, tasks: 6, xp: 200 },
  { day: 'Sat', hours: 5, tasks: 12, xp: 450 },
  { day: 'Sun', hours: 3.5, tasks: 7, xp: 280 },
];

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  xp: Math.floor(Math.random() * 500 + 100),
  hours: Math.random() * 4 + 1,
}));

const formatTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export default function StatisticsDashboard() {
  const { totalStudySeconds, tasksCompleted, sessionsCompleted, xp, level, coins, streak } = useGame();

  const stats = [
    { label: 'XP', value: xp.toLocaleString(), icon: '✨' },
    { label: 'Level', value: level, icon: '⭐' },
    { label: 'Coins', value: coins.toLocaleString(), icon: '🪙' },
    { label: 'Sessions', value: sessionsCompleted, icon: '🎯' },
    { label: 'Study Time', value: formatTime(totalStudySeconds), icon: '⏱️' },
    { label: 'Tasks Done', value: tasksCompleted, icon: '✅' },
    { label: 'Streak', value: `${streak}d`, icon: '🔥' },
  ];

  return (
    <div className="stats-dashboard">
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
            <AreaChart data={weeklyData}>
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
            <LineChart data={monthlyData.slice(0, 14)}>
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
            <BarChart data={weeklyData}>
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
