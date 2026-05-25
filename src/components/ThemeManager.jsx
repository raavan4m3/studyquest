import { useGame } from '../store/GameContext';
import { THEMES } from '../utils/themes';

export default function ThemeManager() {
  const { currentTheme, unlockedThemes, coins, setTheme, unlockTheme, addCoins } = useGame();

  const handleBuy = (theme) => {
    if (unlockedThemes.includes(theme.id) || theme.cost === 0) {
      setTheme(theme.id);
      return;
    }
    if (coins >= theme.cost) {
      addCoins(-theme.cost);
      unlockTheme(theme.id);
      setTheme(theme.id);
    }
  };

  return (
    <div className="theme-manager">
      <h3>Themes</h3>
      <div className="theme-grid">
        {THEMES.map(theme => {
          const unlocked = unlockedThemes.includes(theme.id);
          const active = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              className={`theme-card ${active ? 'active' : ''} ${unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => handleBuy(theme)}
              style={{
                '--theme-bg': theme.colors.bg,
                '--theme-accent': theme.colors.accent,
                '--theme-border': theme.colors.border,
              }}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
              {!unlocked && theme.cost > 0 && (
                <span className="theme-cost">{theme.cost} 🪙</span>
              )}
              {active && <span className="theme-active-badge">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
