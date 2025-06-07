/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';

export type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  // setTheme: (theme: Theme) => void; // Optional: if direct setting is needed
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get initial theme from localStorage or default to 'light'
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('app-theme') as Theme | null : null;

    // Optionally, check for system preference if no stored theme and localStorage is available
    if (typeof window !== 'undefined' && !storedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return storedTheme || 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Apply theme class to body and save to localStorage
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${theme}`); // e.g., theme-light or theme-dark
      localStorage.setItem('app-theme', theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // Optional: direct theme setting function
  // const setCurrentTheme = useCallback((newTheme: Theme) => {
  //   setTheme(newTheme);
  // }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme /*, setTheme: setCurrentTheme */ }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
