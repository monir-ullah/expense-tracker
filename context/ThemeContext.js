import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'appTheme';

const light = {
  mode: 'light',
  colors: {
    primary: '#000000',
    background: '#ffffff',
    card: '#ffffff',
    text: '#000000',
    muted: '#666666',
    border: '#f0f0f0',
    accent: '#4CAF50',
    danger: '#F44336',
    dangerLight: '#FFEBEE',
  }
};

const dark = {
  mode: 'dark',
  colors: {
    primary: '#ffffff',
    background: '#0F1724',
    card: '#0b1220',
    text: '#E6EEF3',
    muted: '#99A0AB',
    border: '#12202b',
    accent: '#4CAF50',
    danger: '#F44336',
    dangerLight: '#2a1515',
  }
};

const ThemeContext = createContext({
  theme: light,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(light);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(THEME_KEY);
        if (value === 'dark') setTheme(dark);
        else setTheme(light);
      } catch (e) {
        console.warn('Failed to load theme', e);
      }
    })();
  }, []);

  const setThemeMode = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (e) {
      console.warn('Failed to persist theme', e);
    }
    setTheme(mode === 'dark' ? dark : light);
  };

  const toggleTheme = () => {
    setThemeMode(theme.mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
