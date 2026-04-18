import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'dofmap-theme';
const ThemeContext = createContext(null);

function applyTheme(theme) {
  const isNight = theme === 'night';
  document.documentElement.classList.remove('night-preload');
  document.body.classList.toggle('night', isNight);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'day';
    } catch {
      return 'day';
    }
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isNight: theme === 'night',
      toggleTheme() {
        setTheme(current => (current === 'night' ? 'day' : 'night'));
      }
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider.');
  return context;
}
