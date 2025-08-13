// settings/theme.tsx
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useTheme } from "@/theme/ThemeProvider";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const availableThemes = ["light", "dark", "pastel", "pink", "blue", "modern"] as const;

export default function ThemeSettingsScreen() {
  const { scheme, setScheme, ui } = useTheme();

  return (
    <ScreenWrapper>
      <Header
        leftIcon={<BackButton />}
        title="Tema"
      />
      {availableThemes.map((themeKey) => (
        <TouchableOpacity
          key={themeKey}
          onPress={() => setScheme(themeKey)}
          style={{
            backgroundColor: ui.bg,
            padding: 24,
            borderRadius: 100,
            marginBottom: 12,
            borderColor: ui.border,
            borderWidth: 1,
          }}
        >
          <Text style={{ color: ui.text, fontSize: 16, }}>
            {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScreenWrapper>
  );
}