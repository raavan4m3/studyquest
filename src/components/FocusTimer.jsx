import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../store/GameContext';
import { checkAchievements } from '../utils/achievements';

export default function FocusTimer() {
  const { timerHours, timerMinutes, timerSeconds, addReward, updateStreak, completeSession, dispatch, ...state } = useGame();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const intervalRef = useRef(null);
  const pipRef = useRef(null);

  const totalSeconds = timerHours * 3600 + timerMinutes * 60 + timerSeconds;

  useEffect(() => {
    if (!pipRef.current || timeLeft === null) return;
    const el = pipRef.current.document.getElementById('pip-digits');
    if (!el) return;
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [timeLeft, pipActive]);

  useEffect(() => {
    if (!isRunning) setTimeLeft(totalSeconds);
  }, [timerHours, timerMinutes, timerSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleComplete = useCallback(() => {
    const sessionSeconds = totalSeconds - timeLeft;
    addReward(50, 25);
    completeSession(sessionSeconds);
    updateStreak();
    setShowComplete(true);
    setTimeout(() => setShowComplete(false), 3000);
    const newState = {
      ...state,
      sessionsCompleted: state.sessionsCompleted + 1,
      totalStudySeconds: state.totalStudySeconds + sessionSeconds,
    };
    checkAchievements(newState, dispatch);
  }, [timeLeft, totalSeconds, addReward, completeSession, updateStreak, state, dispatch]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning === false && totalSeconds > 0) {
      handleComplete();
    }
  }, [timeLeft, isRunning]);

  useEffect(() => {
    if (timeLeft === 0 || !isRunning) closePiP();
  }, [timeLeft, isRunning]);

  useEffect(() => () => closePiP(), []);

  const startTimer = () => {
    if (timeLeft === null || timeLeft === 0) setTimeLeft(totalSeconds);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(totalSeconds); closePiP(); };

  const closePiP = () => {
    try { pipRef.current?.close(); } catch {}
    pipRef.current = null;
    setPipActive(false);
  };

  const openPiP = async () => {
    if (pipRef.current) { closePiP(); return; }
    if (!('documentPictureInPicture' in window)) return;
    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 120,
      });
      pipRef.current = pip;
      setPipActive(true);

      document.querySelectorAll('style').forEach(s => {
        pip.document.head.appendChild(s.cloneNode(true));
      });

      const initTime = timeLeft ?? 0;
      const h = Math.floor(initTime / 3600);
      const m = Math.floor((initTime % 3600) / 60);
      const s = initTime % 60;
      pip.document.body.innerHTML = `
        <div class="pip-timer-container">
          <div class="pip-digits" id="pip-digits">${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</div>
        </div>
      `;

      pip.addEventListener('pagehide', () => closePiP());
    } catch {}
  };

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      {isRunning && createPortal(
        <div className="floating-timer">
          <div className="floating-timer-digits">
            <span>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>
          <button className="floating-timer-btn" onClick={openPiP} title="Pin to screen">{pipActive ? '📌' : '📍'}</button>
          <button className="floating-timer-btn" onClick={pauseTimer} title="Pause">⏸</button>
        </div>,
        document.body
      )}

      <div className="timer-section">
        {showComplete ? (
          <div className="session-complete">
            <div className="complete-icon">🎉</div>
            <h2>Session Complete!</h2>
            <p>Great focus! Take a deep breath.</p>
          </div>
        ) : (
          <>
            <div className="timer-display">
              <div className="timer-digits">
                <span className="digit-group">
                  <span className="digit">{String(hours).padStart(2, '0')}</span>
                  <span className="digit-label">HR</span>
                </span>
                <span className="digit-sep">:</span>
                <span className="digit-group">
                  <span className="digit">{String(minutes).padStart(2, '0')}</span>
                  <span className="digit-label">MIN</span>
                </span>
                <span className="digit-sep">:</span>
                <span className="digit-group">
                  <span className="digit">{String(seconds).padStart(2, '0')}</span>
                  <span className="digit-label">SEC</span>
                </span>
              </div>
            </div>
            <div className="timer-controls">
              {!isRunning ? (
                <button className="timer-btn start" onClick={startTimer} disabled={timeLeft === 0}>
                  ▶ Start
                </button>
              ) : (
                <button className="timer-btn pause" onClick={pauseTimer}>
                  ⏸ Pause
                </button>
              )}
              <button className="timer-btn reset" onClick={resetTimer}>
                ↺ Reset
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
