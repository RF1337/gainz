// app/settings/notifications.tsx
import { useThemeContext } from "@/context/ThemeContext";
import React, { useState } from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";

export default function NotificationsScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";

  // Dummy local state (no actual scheduling logic)
  const [pushEnabled, setPushEnabled] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>
        Notification Settings
      </Text>

      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Enable Push Notifications
        </Text>
        <Switch
          value={pushEnabled}
          onValueChange={setPushEnabled}
          thumbColor={Platform.OS === "android" ? (pushEnabled ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Daily 8 AM Reminder
        </Text>
        <Switch
          value={dailyReminderEnabled}
          onValueChange={setDailyReminderEnabled}
          thumbColor={Platform.OS === "android" ? (dailyReminderEnabled ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
          disabled={!pushEnabled}
        />
      </View>

      {!pushEnabled && (
        <Text style={[styles.note, { color: isDark ? "#888" : "#666" }]}>
          Enable push notifications to use daily reminders.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  note: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
});