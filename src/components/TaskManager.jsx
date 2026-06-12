import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../store/GameContext';
import { checkAchievements } from '../utils/achievements';
import { emitNotification } from './SystemNotification';

function ConfirmModal({ show, task, onYes, onNo }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onNo}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Add to Revision?</h3>
        <p>Would you like to schedule spaced revisions for "<strong>{task}</strong>"?</p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-yes" onClick={onYes}>Yes, schedule</button>
          <button className="modal-btn modal-btn-no" onClick={onNo}>No, thanks</button>
        </div>
      </div>
    </div>
  );
}

export default function TaskManager() {
  const { tasks, addTask, toggleTask, deleteTask, completeTask, addReward, scheduleRevisions, dispatch, ...state } = useGame();
  const [input, setInput] = useState('');
  const [completing, setCompleting] = useState(null);
  const [confirmTask, setConfirmTask] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTask(text);
    setInput('');
  };

  const handleToggle = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setConfirmTask(task);
  };

  const handleConfirmYes = () => {
    if (!confirmTask) return;
    scheduleRevisions(confirmTask.text);
    finishTask(confirmTask.id, confirmTask.text);
    setConfirmTask(null);
  };

  const handleConfirmNo = () => {
    if (!confirmTask) return;
    finishTask(confirmTask.id, confirmTask.text);
    setConfirmTask(null);
  };

  const finishTask = (id, text) => {
    toggleTask(id);
    setCompleting(id);
    addReward(15, 10);
    const rewards = [`+15 XP`, `${text} Mastery Increased`];
    let badge = null;
    if (state.tasksCompleted > 0 && state.tasksCompleted % 5 === 0) {
      rewards.push(`🔓 Skill Unlocked: ${text.split(' ').slice(0, 2).join(' ')} Expert`);
      badge = 'NEW SKILL ACQUIRED';
    }
    emitNotification('QUEST_COMPLETED', { task: text, rewards, badge, progress: 20 });
    setTimeout(() => {
      completeTask(id);
      setCompleting(null);
      const newState = {
        ...state,
        tasksCompleted: state.tasksCompleted + 1,
        tasks: state.tasks.filter(t => t.id !== id),
      };
      checkAchievements(newState, dispatch);
    }, 2000);
  };

  return (
    <div className="task-section command-panel">
      {createPortal(
        <ConfirmModal
          show={!!confirmTask}
          task={confirmTask?.text}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />,
        document.body
      )}
      <div className="command-panel-title">Active Quests</div>
      <div className="task-input-row">
        <input
          ref={inputRef}
          className="task-input"
          placeholder="Add a task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button className="task-add-btn" onClick={handleAdd}>+</button>
      </div>
      <div className="task-list">
        {tasks.filter(t => !t.done).map(task => (
          <div key={task.id} className={`task-card ${completing === task.id ? 'completing' : ''}`}>
            <button className="task-check" onClick={() => handleToggle(task.id)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="4" />
              </svg>
            </button>
            <span className="task-text">{task.text}</span>
            <button className="task-delete" onClick={() => deleteTask(task.id)}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      {completing && createPortal(
        <div className="task-complete-popup">
          <span className="well-done">Well Done! 🎉</span>
        </div>,
        document.body
      )}
    </div>
  );
}