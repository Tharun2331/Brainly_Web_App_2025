// src/hooks/useTheme.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { setDarkMode } from '../store/slices/uiSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector(state => state.ui);

  // Initialize theme from localStorage on first mount
  useEffect(() => {
    const getInitialDarkMode = (): boolean => {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme !== null) {
          return JSON.parse(savedTheme);
        }
        // Check system preference if no saved preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    };

    // Only initialize if this is the first load (no existing state)
    const initialDarkMode = getInitialDarkMode();
    if (isDarkMode !== initialDarkMode) {
      dispatch(setDarkMode(initialDarkMode));
    }
  }, []); // Empty dependency array - only run on mount

  // Apply theme classes whenever isDarkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme === null) {
        dispatch(setDarkMode(e.matches));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [dispatch]);

  return {
    isDarkMode,
    theme: isDarkMode ? 'dark' : 'light'
  };
};