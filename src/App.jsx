import { useGame } from './store/GameContext';
import { THEMES } from './utils/themes';
import Layout from './components/Layout';

export default function App() {
  const { currentTheme } = useGame();
  const theme = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const c = theme.colors;

  const cssVars = {
    '--bg': c.bg,
    '--bg2': c.bg2,
    '--card': c.card,
    '--border': c.border,
    '--text': c.text,
    '--text2': c.text2,
    '--accent': c.accent,
    '--accent2': c.accent2,
    '--success': c.success,
    '--warning': c.warning,
    '--danger': c.danger,
    '--glow': c.glow,
    '--theme-icon': theme.icon,
  };

  return (
    <div className="app" style={cssVars} data-theme={currentTheme}>
      <Layout />
    </div>
  );
}
