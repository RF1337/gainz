// theme/ThemeProvider.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme } from "@react-navigation/native";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeKey, themes, UITheme } from "./theme";

const STORAGE_KEY = "app-theme";

interface ThemeContextValue {
  ui: UITheme;
  navTheme: Theme;
  scheme: ThemeKey;
  setScheme: (k: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  ui: themes.light.ui,
  navTheme: themes.light.nav,
  scheme: "light",
  setScheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme() as ThemeKey | null;
  const [scheme, setSchemeState] = useState<ThemeKey>(system ?? "light");

  const { ui, nav } = themes[scheme];

  const setScheme = async (newScheme: ThemeKey) => {
    setSchemeState(newScheme);
    await AsyncStorage.setItem(STORAGE_KEY, newScheme);
  };

  useEffect(() => {
    const loadStoredTheme = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && stored in themes) {
        setSchemeState(stored as ThemeKey);
      }
    };
    loadStoredTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ ui, navTheme: nav, scheme, setScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);