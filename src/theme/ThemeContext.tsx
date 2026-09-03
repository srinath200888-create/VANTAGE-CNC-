import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, ThemeDefinition } from './types';
import { THEMES, DEFAULT_THEME } from './themes';
import { EventBus } from '../state/EventBus';

interface ThemeContextType {
  theme: ThemeId;
  themeDef: ThemeDefinition;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'industrial_cnc_theme_id';

function applyThemeToDOM(themeDef: ThemeDefinition) {
  const root = document.documentElement;
  const c = themeDef.colors;

  // Set data attributes
  root.setAttribute('data-theme', themeDef.id);
  if (themeDef.isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // Set CSS Variables
  root.style.setProperty('--bg', c.bg);
  root.style.setProperty('--bg-secondary', c.bgSecondary);
  root.style.setProperty('--surface', c.surface);
  root.style.setProperty('--surface-raised', c.surfaceRaised);
  root.style.setProperty('--surface-elevated', c.surfaceElevated);

  root.style.setProperty('--border', c.border);
  root.style.setProperty('--border-subtle', c.borderSubtle);
  root.style.setProperty('--border-active', c.borderActive);

  root.style.setProperty('--text-primary', c.textPrimary);
  root.style.setProperty('--text-secondary', c.textSecondary);
  root.style.setProperty('--text-muted', c.textMuted);
  root.style.setProperty('--text-disabled', c.textDisabled);

  root.style.setProperty('--accent', c.accent);
  root.style.setProperty('--accent-soft', c.accentSoft);
  root.style.setProperty('--accent-strong', c.accentStrong);

  root.style.setProperty('--success', c.success);
  root.style.setProperty('--success-soft', c.successSoft);
  root.style.setProperty('--warning', c.warning);
  root.style.setProperty('--warning-soft', c.warningSoft);
  root.style.setProperty('--critical', c.critical);
  root.style.setProperty('--critical-soft', c.criticalSoft);
  root.style.setProperty('--info', c.info);
  root.style.setProperty('--info-soft', c.infoSoft);

  root.style.setProperty('--chart-primary', c.chartPrimary);
  root.style.setProperty('--chart-secondary', c.chartSecondary);
  root.style.setProperty('--chart-grid', c.chartGrid);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {
      // fallback
    }
    return DEFAULT_THEME;
  });

  const themeDef = THEMES[theme] || THEMES[DEFAULT_THEME];

  useEffect(() => {
    applyThemeToDOM(themeDef);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    EventBus.emit('THEME_CHANGED', themeDef);
  }, [theme, themeDef]);

  const setTheme = (newTheme: ThemeId) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeDef,
        setTheme,
        availableThemes: Object.values(THEMES)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
