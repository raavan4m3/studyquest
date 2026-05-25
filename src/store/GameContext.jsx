import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const GameContext = createContext();

const LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 250 },
  { level: 4, xpRequired: 500 },
  { level: 5, xpRequired: 1000 },
  { level: 6, xpRequired: 1800 },
  { level: 7, xpRequired: 3000 },
  { level: 8, xpRequired: 5000 },
  { level: 9, xpRequired: 8000 },
  { level: 10, xpRequired: 12000 },
];

function getLevel(xp) {
  let lvl = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) { lvl = LEVELS[i].level; break; }
  }
  return lvl;
}

function getLevelProgress(xp) {
  const lvl = getLevel(xp);
  const current = LEVELS.find(l => l.level === lvl);
  const next = LEVELS.find(l => l.level === lvl + 1);
  if (!next) return { current: xp, required: xp, progress: 1 };
  return {
    current: xp - current.xpRequired,
    required: next.xpRequired - current.xpRequired,
    progress: (xp - current.xpRequired) / (next.xpRequired - current.xpRequired),
  };
}

const initialState = {
  xp: 0,
  coins: 0,
  streak: 0,
  lastStudyDate: null,
  totalStudySeconds: 0,
  tasksCompleted: 0,
  sessionsCompleted: 0,
  achievements: [],
  unlockedThemes: ['dark', 'light', 'forest', 'ocean', 'space', 'cyberpunk', 'anime', 'minimal'],
  currentTheme: 'light',
  unlockedPets: ['blob'],
  currentPet: 'blob',
  timerHours: 0,
  timerMinutes: 25,
  timerSeconds: 0,
  showReward: null,
  showAchievement: null,
  showLevelUp: null,
  tasks: [],
  statsHistory: [],
  revisions: [],
};

function loadState() {
  try {
    const saved = localStorage.getItem('studyquest_save');
    if (saved) return { ...initialState, ...JSON.parse(saved) };
  } catch (e) { /* ignore */ }
  return initialState;
}

function saveState(state) {
  try {
    localStorage.setItem('studyquest_save', JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

function gameReducer(state, action) {
  let newState;
  switch (action.type) {
    case 'ADD_XP': {
      const newXp = state.xp + action.payload;
      const oldLevel = getLevel(state.xp);
      const newLevel = getLevel(newXp);
      newState = { ...state, xp: newXp, showReward: { xp: action.payload, coins: 0 } };
      if (newLevel > oldLevel) {
        newState.showLevelUp = { level: newLevel, coins: newLevel * 50 };
        newState.coins += newLevel * 50;
      }
      break;
    }
    case 'ADD_COINS':
      newState = { ...state, coins: state.coins + action.payload };
      break;
    case 'ADD_REWARD':
      newState = {
        ...state,
        xp: state.xp + (action.payload.xp || 0),
        coins: state.coins + (action.payload.coins || 0),
        showReward: { xp: action.payload.xp || 0, coins: action.payload.coins || 0 },
      };
      {
        const oldLevel = getLevel(state.xp - (action.payload.xp || 0));
        const newLevel = getLevel(state.xp);
        if (newLevel > oldLevel) {
          newState.showLevelUp = { level: newLevel, coins: newLevel * 50 };
          newState.coins += newLevel * 50;
        }
      }
      break;
    case 'CLEAR_REWARD':
      newState = { ...state, showReward: null };
      break;
    case 'CLEAR_LEVEL_UP':
      newState = { ...state, showLevelUp: null };
      break;
    case 'UNLOCK_ACHIEVEMENT': {
      if (state.achievements.includes(action.payload.id)) {
        newState = { ...state, showAchievement: null };
        break;
      }
      newState = {
        ...state,
        achievements: [...state.achievements, action.payload.id],
        xp: state.xp + (action.payload.xp || 0),
        coins: state.coins + (action.payload.coins || 0),
        showAchievement: { name: action.payload.name, xp: action.payload.xp || 0, coins: action.payload.coins || 0 },
      };
      break;
    }
    case 'CLEAR_ACHIEVEMENT':
      newState = { ...state, showAchievement: null };
      break;
    case 'COMPLETE_SESSION':
      newState = {
        ...state,
        sessionsCompleted: state.sessionsCompleted + 1,
        totalStudySeconds: state.totalStudySeconds + action.payload,
      };
      break;
    case 'COMPLETE_TASK':
      newState = {
        ...state,
        tasksCompleted: state.tasksCompleted + 1,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      };
      break;
    case 'ADD_TASK':
      newState = { ...state, tasks: [...state.tasks, { id: Date.now(), text: action.payload, done: false }] };
      break;
    case 'TOGGLE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, done: !t.done } : t),
      };
      break;
    case 'DELETE_TASK':
      newState = { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
      break;
    case 'SET_TIMER':
      newState = { ...state, ...action.payload };
      break;
    case 'UPDATE_STREAK': {
      const today = new Date().toDateString();
      const last = state.lastStudyDate;
      let newStreak = state.streak;
      if (last !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        newStreak = last === yesterday ? state.streak + 1 : 1;
      }
      newState = { ...state, streak: newStreak, lastStudyDate: today };
      break;
    }
    case 'SET_THEME':
      newState = { ...state, currentTheme: action.payload };
      break;
    case 'UNLOCK_THEME':
      newState = { ...state, unlockedThemes: [...state.unlockedThemes, action.payload] };
      break;
    case 'SET_PET':
      newState = { ...state, currentPet: action.payload };
      break;
    case 'UNLOCK_PET':
      newState = { ...state, unlockedPets: [...state.unlockedPets, action.payload] };
      break;
    case 'SET_TASKS':
      newState = { ...state, tasks: action.payload };
      break;
    case 'SCHEDULE_REVISIONS': {
      const now = action.payload.completedAt;
      const existing = state.revisions || [];
      const intervals = [
        { interval: 1, label: '1 Hour', offset: 3600000 },
        { interval: 2, label: '24 Hours', offset: 86400000 },
        { interval: 3, label: '1 Week', offset: 604800000 },
        { interval: 4, label: '1 Month', offset: 2592000000 },
        { interval: 5, label: '3 Months', offset: 7776000000 },
      ];
      const newRevisions = intervals.map(int => ({
        id: Date.now() + int.interval,
        groupId: Date.now(),
        topic: action.payload.topic || 'Study Session',
        interval: int.interval,
        label: int.label,
        dueAt: now + int.offset,
        completed: false,
        completedAt: null,
      }));
      newState = { ...state, revisions: [...existing, ...newRevisions] };
      break;
    }
    case 'COMPLETE_REVISION': {
      const existing = state.revisions || [];
      newState = {
        ...state,
        revisions: existing.map(r =>
          r.id === action.payload.id ? { ...r, completed: true, completedAt: Date.now(), duration: action.payload.duration } : r
        ),
      };
      break;
    }
    case 'DELETE_REVISION':
      newState = { ...state, revisions: (state.revisions || []).filter(r => r.id !== action.payload) };
      break;
    case 'DELETE_REVISION_GROUP':
      newState = { ...state, revisions: (state.revisions || []).filter(r => r.groupId !== action.payload) };
      break;
    case 'CLEAR_COMPLETED_REVISIONS':
      newState = { ...state, revisions: (state.revisions || []).filter(r => !r.completed) };
      break;
    default:
      newState = state;
  }
  return newState;
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, loadState);

  const addXP = useCallback((amount) => dispatch({ type: 'ADD_XP', payload: amount }), []);
  const addCoins = useCallback((amount) => dispatch({ type: 'ADD_COINS', payload: amount }), []);
  const addReward = useCallback((xp, coins) => dispatch({ type: 'ADD_REWARD', payload: { xp, coins } }), []);
  const clearReward = useCallback(() => dispatch({ type: 'CLEAR_REWARD' }), []);
  const clearLevelUp = useCallback(() => dispatch({ type: 'CLEAR_LEVEL_UP' }), []);
  const unlockAchievement = useCallback((id, name, xp, coins) =>
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { id, name, xp, coins } }), []);
  const clearAchievement = useCallback(() => dispatch({ type: 'CLEAR_ACHIEVEMENT' }), []);
  const completeSession = useCallback((seconds) => dispatch({ type: 'COMPLETE_SESSION', payload: seconds }), []);
  const completeTask = useCallback((id) => dispatch({ type: 'COMPLETE_TASK', payload: id }), []);
  const addTask = useCallback((text) => dispatch({ type: 'ADD_TASK', payload: text }), []);
  const toggleTask = useCallback((id) => dispatch({ type: 'TOGGLE_TASK', payload: id }), []);
  const deleteTask = useCallback((id) => dispatch({ type: 'DELETE_TASK', payload: id }), []);
  const setTimer = useCallback((h, m, s) => dispatch({ type: 'SET_TIMER', payload: { timerHours: h, timerMinutes: m, timerSeconds: s } }), []);
  const updateStreak = useCallback(() => dispatch({ type: 'UPDATE_STREAK' }), []);
  const setTheme = useCallback((t) => dispatch({ type: 'SET_THEME', payload: t }), []);
  const unlockTheme = useCallback((t) => dispatch({ type: 'UNLOCK_THEME', payload: t }), []);
  const setPet = useCallback((p) => dispatch({ type: 'SET_PET', payload: p }), []);
  const unlockPet = useCallback((p) => dispatch({ type: 'UNLOCK_PET', payload: p }), []);
  const scheduleRevisions = useCallback((topic) => dispatch({ type: 'SCHEDULE_REVISIONS', payload: { completedAt: Date.now(), topic } }), []);
  const completeRevision = useCallback((id, duration) => dispatch({ type: 'COMPLETE_REVISION', payload: { id, duration } }), []);
  const deleteRevision = useCallback((id) => dispatch({ type: 'DELETE_REVISION', payload: id }), []);
  const deleteRevisionGroup = useCallback((groupId) => dispatch({ type: 'DELETE_REVISION_GROUP', payload: groupId }), []);
  const clearCompletedRevisions = useCallback(() => dispatch({ type: 'CLEAR_COMPLETED_REVISIONS' }), []);

  const level = getLevel(state.xp);
  const levelProgress = getLevelProgress(state.xp);
  const nextLevelXp = LEVELS.find(l => l.level === level + 1)?.xpRequired || state.xp;

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = {
    ...state,
    level,
    levelProgress,
    nextLevelXp,
    addXP,
    addCoins,
    addReward,
    clearReward,
    clearLevelUp,
    unlockAchievement,
    clearAchievement,
    completeSession,
    completeTask,
    addTask,
    toggleTask,
    deleteTask,
    setTimer,
    updateStreak,
    setTheme,
    unlockTheme,
    setPet,
    unlockPet,
    scheduleRevisions,
    completeRevision,
    deleteRevision,
    deleteRevisionGroup,
    clearCompletedRevisions,
    dispatch,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { getLevel, getLevelProgress, LEVELS };
