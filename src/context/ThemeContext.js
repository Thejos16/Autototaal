import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    const isDarkMode = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
    setIsDark(isDarkMode);
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const saveTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const themeColors = {
    light: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      primary: '#007AFF',
      secondary: '#5856D6',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E5E5E5',
      card: '#FFFFFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    },
    dark: {
      background: '#000000',
      surface: '#1C1C1E',
      primary: '#0A84FF',
      secondary: '#5E5CE6',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      border: '#38383A',
      card: '#1C1C1E',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A',
    },
  };

  const currentColors = themeColors[isDark ? 'dark' : 'light'];

  const value = {
    theme,
    isDark,
    colors: currentColors,
    setTheme: saveTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 