// app/settings/security.tsx
import { useThemeContext } from "@/context/ThemeContext";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function SecurityScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";

  // Dummy state for security toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricUnlock, setBiometricUnlock] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>
        Security & Permissions
      </Text>

      <Text style={[styles.subHeader, { color: isDark ? "#fff" : "#000" }]}>
        Security Settings
      </Text>
      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Two-Factor Authentication
        </Text>
        <Switch
          value={twoFactorEnabled}
          onValueChange={setTwoFactorEnabled}
          thumbColor={Platform.OS === "android" ? (twoFactorEnabled ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Biometric Unlock
        </Text>
        <Switch
          value={biometricUnlock}
          onValueChange={setBiometricUnlock}
          thumbColor={Platform.OS === "android" ? (biometricUnlock ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <Text style={[styles.subHeader, { color: isDark ? "#fff" : "#000", marginTop: 24 }]}>
        App Permissions
      </Text>
      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Location Access
        </Text>
        <Switch
          value={locationPermission}
          onValueChange={setLocationPermission}
          thumbColor={Platform.OS === "android" ? (locationPermission ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <View style={[styles.row, { borderBottomColor: isDark ? "#444" : "#ccc" }]}>
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Camera Access
        </Text>
        <Switch
          value={cameraPermission}
          onValueChange={setCameraPermission}
          thumbColor={Platform.OS === "android" ? (cameraPermission ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <Text style={[styles.note, { color: isDark ? "#888" : "#666" }]}>
        Manage your security preferences and app permissions.
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
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 8,
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
