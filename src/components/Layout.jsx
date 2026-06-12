import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../store/GameContext';
import FocusTimer from './FocusTimer';
import TaskManager from './TaskManager';
import XPBar from './XPBar';
import DailyStreak from './DailyStreak';
import AIRival from './AIRival';
import Leaderboard from './Leaderboard';
import StatisticsDashboard from './StatisticsDashboard';
import RevisionDashboard from './RevisionDashboard';
import Settings from './Settings';
import ConfettiEffect from './ConfettiEffect';
import RewardPopup from './RewardPopup';
import LevelUpPopup from './LevelUpPopup';
import AchievementPopup from './AchievementPopup';
import ThreeScene from './ThreeScene';
import InstallButton from './InstallButton';
import SystemNotification from './SystemNotification';

export default function Layout() {
  const {
    showReward, showLevelUp, showAchievement,
    clearReward, clearLevelUp, clearAchievement, revisions, rank, currentTheme, level,
  } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('studyquest_tab');
    return saved === 'rival' ? 'main' : saved || 'main';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  useEffect(() => { localStorage.setItem('studyquest_tab', activeTab); }, [activeTab]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [revAlert, setRevAlert] = useState(null);
  const alertedRef = useRef(new Set());

  const checkDue = useCallback(() => {
    if (!Array.isArray(revisions)) return;
    const now = Date.now();
    const due = revisions.filter(r => !r.completed && r.dueAt <= now && !alertedRef.current.has(r.id));
    if (due.length > 0) {
      const r = due[0];
      alertedRef.current.add(r.id);
      setRevAlert({ id: r.id, topic: r.topic, interval: r.interval });
      setActiveTab('revision');
      setTimeout(() => setRevAlert(null), 1000);
    }
  }, [revisions]);

  useEffect(() => { checkDue(); }, [checkDue]);

  useEffect(() => {
    const id = setInterval(checkDue, 3000);
    return () => clearInterval(id);
  }, [checkDue]);

  const triggerConfetti = () => setConfettiTrigger(t => t + 1);

  const renderContent = () => (
    <>
      <ThreeScene />
      <div className={`main-content ${activeTab !== 'main' ? 'hidden' : ''}`}>
        <div className="left-panel">
          <FocusTimer />
        </div>
        <div className="right-panel">
          <TaskManager />
          <AIRival compact />
        </div>
      </div>
      {activeTab === 'leaderboard' && (
        <div className="tab-page">
          <h2 className="page-title">Leaderboard</h2>
          <Leaderboard />
        </div>
      )}
      {activeTab === 'stats' && (
        <div className="tab-page">
          <h2 className="page-title">Statistics</h2>
          <StatisticsDashboard />
        </div>
      )}
      {activeTab === 'revision' && (
        <div className="tab-page">
          <h2 className="page-title">Spaced Revision</h2>
          <RevisionDashboard />
        </div>
      )}
    </>
  );

  return (
    <div className="app-layout">
      <ConfettiEffect trigger={confettiTrigger} />
      <RewardPopup reward={showReward} onComplete={clearReward} />
      <LevelUpPopup level={showLevelUp?.level} onComplete={clearLevelUp} />
      <AchievementPopup achievement={showAchievement} onComplete={clearAchievement} />
      <SystemNotification />
      {revAlert && createPortal(
        <div className="rev-alert" onClick={() => setRevAlert(null)}>
          <span className="rev-alert-icon">📚</span>
          <span className="rev-alert-text"><strong>{revAlert.topic}</strong> — Revision #{revAlert.interval} is due!</span>
        </div>,
        document.body
      )}

      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">
            {currentTheme === 'solo' && <span className="rank-badge" style={{ color: rank.color }}>{rank.icon} {rank.rank}-Rank</span>}
            <span>🎮 StudyQuest</span>
          </span>
          <XPBar />
        </div>
        <div className="header-center">
          <nav className="header-nav">
            <button className={`nav-btn ${activeTab === 'main' ? 'active' : ''}`} onClick={() => handleTab('main')}>Home</button>
            <button className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => handleTab('leaderboard')}>Leaderboard</button>
            <button className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => handleTab('stats')}>Stats</button>
            <button className={`nav-btn ${activeTab === 'revision' ? 'active' : ''}`} onClick={() => handleTab('revision')}>Revision</button>
          </nav>
          <button className="hamburger-btn" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Menu">
            <span className={`hamburger-line ${mobileNavOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileNavOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileNavOpen ? 'open' : ''}`} />
          </button>
        </div>
        <div className="header-right">
          <DailyStreak />
          <InstallButton />
          <button className="settings-btn" onClick={() => setSettingsOpen(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </header>

      <div className={`mobile-nav-overlay ${mobileNavOpen ? 'open' : ''}`} onClick={() => setMobileNavOpen(false)}>
        <nav className="mobile-nav" onClick={e => e.stopPropagation()}>
          <button className={`mobile-nav-btn ${activeTab === 'main' ? 'active' : ''}`} onClick={() => handleTab('main')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </button>
          <button className={`mobile-nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => handleTab('leaderboard')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C5 4 6 2 8 2c2 0 3 2 4 4"/><path d="M12 6v4"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C19 4 18 2 16 2c-2 0-3 2-4 4"/><path d="M8 2h8"/><circle cx="12" cy="12" r="3"/><path d="M12 15v4"/><path d="M8 22h8"/></svg>
            Leaderboard
          </button>
          <button className={`mobile-nav-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => handleTab('stats')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Stats
          </button>
          <button className={`mobile-nav-btn ${activeTab === 'revision' ? 'active' : ''}`} onClick={() => handleTab('revision')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Revision
          </button>
        </nav>
      </div>

      <main className="app-main">
        {renderContent()}
      </main>

      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}