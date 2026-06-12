import { useMemo, useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const curveData = [
  { label: '0h', hour: 0, retention: 100, revised: 100 },
  { label: '20m', hour: 0.33, retention: 60, revised: 100 },
  { label: '1h', hour: 1, retention: 50, revised: 95 },
  { label: '6h', hour: 6, retention: 40, revised: 93 },
  { label: '24h', hour: 24, retention: 30, revised: 88 },
  { label: '3d', hour: 72, retention: 18, revised: 85 },
  { label: '1w', hour: 168, retention: 10, revised: 90 },
  { label: '2w', hour: 336, retention: 7, revised: 86 },
  { label: '1m', hour: 720, retention: 5, revised: 82 },
  { label: '2m', hour: 1440, retention: 4, revised: 80 },
  { label: '3m', hour: 2160, retention: 3, revised: 78 },
];

function formatCountdown(ts) {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const totalSec = Math.floor(abs / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  parts.push(`${String(h).padStart(2, '0')}h`);
  parts.push(`${String(m).padStart(2, '0')}m`);
  parts.push(`${String(s).padStart(2, '0')}s`);
  return { text: parts.join(' '), overdue: diff < 0 };
}

function Countdown({ dueAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const { text, overdue } = formatCountdown(dueAt);
  return <span className={`rev-countdown ${overdue ? 'overdue' : ''}`}>{overdue ? `Overdue ${text}` : `Due ${text}`}</span>;
}

function ForgettingCurve() {
  try {
    return (
      <div className="rev-chart-card">
        <h3 className="rev-chart-title">Memory Retention Curve</h3>
        <p className="rev-chart-sub">Without revision, retention drops to ~10% in a week. Spaced revision at increasing intervals keeps retention above 75% even after 3 months.</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={curveData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revisedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00b894" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00b894" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" stroke="#8888aa" fontSize={11} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#8888aa" fontSize={11} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              formatter={(v, name) => [ `${v}%`, name === 'retention' ? 'Without revision' : 'With spaced revision' ]}
              labelFormatter={l => `Time: ${l}`}
            />
            <Area type="monotone" dataKey="retention" stroke="#e17055" strokeWidth={2} fill="url(#retentionGrad)" strokeDasharray="6 4" dot={false} activeDot={{ r: 4, fill: '#e17055' }} />
            <Area type="monotone" dataKey="revised" stroke="#00b894" strokeWidth={2} fill="url(#revisedGrad)" dot={false} activeDot={{ r: 4, fill: '#00b894' }} />
            {['1h', '24h', '1w', '1m'].map((l, i) => (
              <ReferenceLine key={i} x={l} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        <div className="rev-chart-legend">
          <span className="rev-legend-item"><span className="rev-legend-line dashed" /> Without revision</span>
          <span className="rev-legend-item"><span className="rev-legend-line solid" /> With spaced revision</span>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

function formatElapsed(ms) {
  if (!ms) return '';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function timeAgo(ts) {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const units = [
    [86400000, 'day'],
    [3600000, 'hour'],
    [60000, 'min'],
  ];
  for (const [ms, label] of units) {
    const n = Math.floor(abs / ms);
    if (n >= 1) return diff > 0 ? `in ${n} ${label}${n > 1 ? 's' : ''}` : `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return diff > 0 ? 'soon' : 'just now';
}

function RevisionGroup({ group, defaultOpen }) {
  const { completeRevision, deleteRevisionGroup } = useGame();
  const [open, setOpen] = useState(defaultOpen);
  const [inProgressId, setInProgressId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const { topic, revisions, groupId } = group;
  const pending = revisions.filter(r => !r.completed);
  const completed = revisions.filter(r => r.completed);
  const hasOverdue = pending.some(r => r.dueAt < Date.now());
  const doneCount = completed.length;
  const total = revisions.length;
  const sortedPending = [...pending].sort((a, b) => a.dueAt - b.dueAt);
  const currentRevision = sortedPending.length > 0 && sortedPending[0].dueAt <= Date.now() ? sortedPending[0].id : null;

  useEffect(() => {
    if (!inProgressId) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(id);
  }, [inProgressId, startTime]);

  const handleStart = (id) => {
    setInProgressId(id);
    setStartTime(Date.now());
    setElapsed(0);
  };

  const handleDone = (id) => {
    completeRevision(id, elapsed);
    setInProgressId(null);
    setStartTime(null);
    setElapsed(0);
  };

  const formatTimer = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className={`rev-group ${hasOverdue ? 'rev-group-overdue' : ''}`}>
      <div className="rev-group-header" onClick={() => setOpen(!open)}>
        <span className="rev-group-arrow">{open ? '▼' : '▶'}</span>
        <span className="rev-group-topic">{topic}</span>
        <span className="rev-group-status">
          {hasOverdue && <span className="rev-group-badge overdue">{pending.filter(r => r.dueAt < Date.now()).length} overdue</span>}
          <span className="rev-group-count">{doneCount}/{total} done</span>
          <button className="rev-group-close" onClick={e => { e.stopPropagation(); deleteRevisionGroup(groupId); }} title="Remove all revisions">✕</button>
        </span>
      </div>
      {open && (
        <div className="rev-group-body">
          {revisions.sort((a, b) => a.interval - b.interval).map(r => {
            const isCurrent = r.id === currentRevision;
            const isActive = r.id === inProgressId;
            return (
              <div key={r.id} className={`rev-group-entry ${r.completed ? 'done' : r.dueAt < Date.now() ? 'overdue' : ''} ${isActive ? 'active' : ''}`}>
                <div className="rev-info">
                  <span className="rev-topic">Revision #{r.interval}</span>
                  <span className="rev-meta">{r.label} — {r.completed ? `completed ${timeAgo(r.completedAt)}${r.duration ? ` · ${formatElapsed(r.duration)}` : ''}` : <Countdown dueAt={r.dueAt} />}</span>
                </div>
                <div className="rev-actions">
                  {!r.completed && !isActive && (
                    <button className={`rev-btn ${!isCurrent ? 'rev-btn-faded' : ''}`} onClick={isCurrent ? () => handleStart(r.id) : undefined}>
                      Start
                    </button>
                  )}
                  {isActive && (
                    <div className="rev-active-row">
                      <span className="rev-timer">{formatTimer(elapsed)}</span>
                      <button className="rev-btn rev-btn-done" onClick={() => handleDone(r.id)}>Done</button>
                    </div>
                  )}
                  {r.completed && <span className="rev-checked">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CompletedSection({ groups }) {
  const { clearCompletedRevisions } = useGame();
  const [open, setOpen] = useState(false);
  const totalDone = groups.reduce((s, g) => s + g.revisions.length, 0);
  return (
    <div className="rev-completed-section">
      <div className="rev-completed-header" onClick={() => setOpen(!open)}>
        <span className="rev-group-arrow">{open ? '▼' : '▶'}</span>
        <span className="rev-section-title">Completed Reviews</span>
        <span className="rev-group-count">{totalDone} done</span>
        <button className="rev-group-close" onClick={e => { e.stopPropagation(); clearCompletedRevisions(); }} title="Clear completed history">✕</button>
      </div>
      {open && (
        <div className="rev-completed-body">
          {groups.map(g => (
            <div key={g.groupId} className="rev-completed-task">
              <div className="rev-completed-task-name">{g.topic}</div>
              {g.revisions.sort((a, b) => a.interval - b.interval).map(r => (
                <div key={r.id} className="rev-group-entry done">
                  <div className="rev-info">
                    <span className="rev-topic">Revision #{r.interval}</span>
                    <span className="rev-meta">{r.label} — completed {timeAgo(r.completedAt)}{r.duration ? ` · ${formatElapsed(r.duration)}` : ''}</span>
                  </div>
                  <span className="rev-checked">✓</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RevisionDashboard() {
  const ctx = useGame();
  const revisions = ctx.revisions || [];
  const { sessionsCompleted, totalStudySeconds } = ctx;

  const groups = useMemo(() => {
    const map = {};
    if (Array.isArray(revisions)) {
      for (const r of revisions) {
        if (!map[r.groupId]) map[r.groupId] = { groupId: r.groupId, topic: r.topic, revisions: [] };
        map[r.groupId].revisions.push(r);
      }
    }
    return Object.values(map).sort((a, b) => {
      const aHasPending = a.revisions.some(r => !r.completed);
      const bHasPending = b.revisions.some(r => !r.completed);
      if (aHasPending && !bHasPending) return -1;
      if (!aHasPending && bHasPending) return 1;
      return b.groupId - a.groupId;
    });
  }, [revisions]);

  const activeGroups = groups.filter(g => g.revisions.some(r => !r.completed));
  const completedGroups = groups.filter(g => g.revisions.every(r => r.completed));

  const allPending = revisions.filter(r => !r.completed && Array.isArray(revisions));
  const allCompleted = revisions.filter(r => r.completed && Array.isArray(revisions));
  const overdue = allPending.filter(r => r.dueAt < Date.now());
  const totalSessions = Array.isArray(revisions) ? new Set(revisions.map(r => r.groupId)).size : 0;
  const completionRate = revisions.length > 0 ? Math.round((allCompleted.length / revisions.length) * 100) : 0;
  const studyHours = Math.round(totalStudySeconds / 3600);
  const nextDue = allPending.length > 0 ? allPending.sort((a, b) => a.dueAt - b.dueAt)[0] : null;

  return (
    <div className="revision-dashboard panel-border">
      <div className="revision-stats">
        <div className="rev-stat-card">
          <span className="rev-stat-num">{allPending.length}</span>
          <span className="rev-stat-label">Pending</span>
        </div>
        <div className="rev-stat-card warn">
          <span className="rev-stat-num">{overdue.length}</span>
          <span className="rev-stat-label">Overdue</span>
        </div>
        <div className="rev-stat-card">
          <span className="rev-stat-num">{allCompleted.length}</span>
          <span className="rev-stat-label">Completed</span>
        </div>
        <div className="rev-stat-card">
          <span className="rev-stat-num">{totalSessions}</span>
          <span className="rev-stat-label">Sessions</span>
        </div>
        <div className="rev-stat-card">
          <span className="rev-stat-num">{completionRate}%</span>
          <span className="rev-stat-label">Completion</span>
        </div>
      </div>

      <ForgettingCurve />

      <div className="rev-recommendations">
        <h3 className="rev-recommend-title">Recommendations</h3>
        {overdue.length > 0 && (
          <div className="rev-rec-card urgent">
            <span className="rev-rec-icon">🔴</span>
            <span>You have <strong>{overdue.length}</strong> overdue review{overdue.length > 1 ? 's' : ''}! Memory fades fast — complete them now to lock in your learning.</span>
          </div>
        )}
        {nextDue && overdue.length === 0 && (
          <div className="rev-rec-card">
            <span className="rev-rec-icon">⏰</span>
            <span>Next review <strong>{nextDue.topic}</strong> — <Countdown dueAt={nextDue.dueAt} /></span>
          </div>
        )}
        {allCompleted.length >= 5 && completionRate >= 80 && (
          <div className="rev-rec-card success">
            <span className="rev-rec-icon">🌟</span>
            <span>Great consistency! You've completed {allCompleted.length} reviews with {completionRate}% rate. Your long-term retention is improving.</span>
          </div>
        )}
        {sessionsCompleted === 0 && (
          <div className="rev-rec-card">
            <span className="rev-rec-icon">💡</span>
            <span>Complete your first study session to start the spaced revision system. Each session schedules 5 reviews at optimal intervals (1h → 24h → 1w → 1m → 3m).</span>
          </div>
        )}
        {sessionsCompleted > 0 && allPending.length === 0 && allCompleted.length === 0 && (
          <div className="rev-rec-card">
            <span className="rev-rec-icon">⏳</span>
            <span>You've studied <strong>{studyHours}h</strong> across <strong>{sessionsCompleted}</strong> session{sessionsCompleted > 1 ? 's' : ''}. Revisions are scheduled but none are due yet — check back soon!</span>
          </div>
        )}
        {allPending.length > 0 && overdue.length === 0 && (
          <div className="rev-rec-card">
            <span className="rev-rec-icon">📚</span>
            <span>You have <strong>{allPending.length}</strong> upcoming revision{allPending.length > 1 ? 's' : ''} scheduled. Following this spaced repetition schedule helps move knowledge from short-term to long-term memory.</span>
          </div>
        )}
      </div>

      {activeGroups.length === 0 && completedGroups.length === 0 && revisions.length === 0 && (
        <div className="revision-empty">
          <p>Complete a task to schedule spaced revisions. Each task gets 5 reviews at optimal intervals (1h → 24h → 1w → 1m → 3m).</p>
        </div>
      )}

      {activeGroups.length > 0 && (
        <div className="rev-groups">
          <h3 className="rev-section-title">Active Reviews</h3>
          {activeGroups.map(g => (
            <RevisionGroup key={g.groupId} group={g} defaultOpen={true} />
          ))}
        </div>
      )}

      {completedGroups.length > 0 && (
        <div className="rev-groups">
          <CompletedSection groups={completedGroups} />
        </div>
      )}
    </div>
  );
}