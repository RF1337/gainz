import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type Scheme = 'light' | 'dark';

const ThemeContext = createContext<{
  scheme: Scheme;
  toggleScheme: () => void;
}>({
  scheme: 'light',
  toggleScheme: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const [scheme, setScheme] = useState<Scheme>(systemScheme);

  useEffect(() => {
    AsyncStorage.getItem('colorSchemeOverride').then((stored) => {
      if (stored === 'light' || stored === 'dark') {
        setScheme(stored);
      }
    });
  }, []);

  const toggleScheme = () => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    setScheme(next);
    AsyncStorage.setItem('colorSchemeOverride', next);
  };

  return (
    <ThemeContext.Provider value={{ scheme, toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}