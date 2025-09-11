'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

export interface ThemeProviderState {
  theme: Theme;
  colorScheme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system' as Theme,
  colorScheme: 'light',
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [colorScheme, setColorScheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = storedTheme || 'light';
    setThemeState(initialTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    setColorScheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    colorScheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}