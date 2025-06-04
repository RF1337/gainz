// app/settings/privacy.tsx
import { useThemeContext } from "@/context/ThemeContext";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function PrivacyScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";

  // Dummy state for privacy toggles
  const [privateProfile, setPrivateProfile] = useState(false);
  const [shareUsageData, setShareUsageData] = useState(false);
  const [adPersonalization, setAdPersonalization] = useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>
        Privacy Settings
      </Text>

      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Private Profile
        </Text>
        <Switch
          value={privateProfile}
          onValueChange={setPrivateProfile}
          thumbColor={Platform.OS === "android" ? (privateProfile ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Share Usage Data
        </Text>
        <Switch
          value={shareUsageData}
          onValueChange={setShareUsageData}
          thumbColor={Platform.OS === "android" ? (shareUsageData ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Ad Personalization
        </Text>
        <Switch
          value={adPersonalization}
          onValueChange={setAdPersonalization}
          thumbColor={Platform.OS === "android" ? (adPersonalization ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <Text style={[styles.note, { color: isDark ? "#888" : "#666" }]}>
        Adjust these privacy options to control visibility and data sharing.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 24,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  note: {
    marginTop: 24,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});