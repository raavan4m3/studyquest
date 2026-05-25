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

export default function Layout() {
  const {
    showReward, showLevelUp, showAchievement,
    clearReward, clearLevelUp, clearAchievement, revisions,
  } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('studyquest_tab') || 'main');

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
      {activeTab === 'rival' && (
        <div className="tab-page">
          <h2 className="page-title">AI Rival</h2>
          <AIRival />
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
      {revAlert && createPortal(
        <div className="rev-alert" onClick={() => setRevAlert(null)}>
          <span className="rev-alert-icon">📚</span>
          <span className="rev-alert-text"><strong>{revAlert.topic}</strong> — Revision #{revAlert.interval} is due!</span>
        </div>,
        document.body
      )}

      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">🎮 StudyQuest</span>
          <XPBar />
        </div>
        <div className="header-center">
          <nav className="header-nav">
            <button className={`nav-btn ${activeTab === 'main' ? 'active' : ''}`} onClick={() => setActiveTab('main')}>Home</button>
            <button className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>Leaderboard</button>
            <button className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
            <button className={`nav-btn ${activeTab === 'rival' ? 'active' : ''}`} onClick={() => setActiveTab('rival')}>Rival</button>
            <button className={`nav-btn ${activeTab === 'revision' ? 'active' : ''}`} onClick={() => setActiveTab('revision')}>Revision</button>
          </nav>
        </div>
        <div className="header-right">
          <DailyStreak />
          <button className="settings-btn" onClick={() => setSettingsOpen(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </header>

      <main className="app-main">
        {renderContent()}
      </main>

      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}