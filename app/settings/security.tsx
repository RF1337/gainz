// app/settings/security.tsx
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useTheme } from "@/theme/ThemeProvider";
import React, { useState } from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";

export default function SecurityScreen() {
  const { ui } = useTheme();

  // Dummy state for security toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricUnlock, setBiometricUnlock] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);

  return (
    <ScreenWrapper>
      <Header
        leftIcon={<BackButton />}
        title="Security & Permissions"
      />
      <Text style={[styles.subHeader, { color: ui.text }]}>
        Security Settings
      </Text>
      <View style={[styles.row, { borderBottomColor: ui.border }]}>
        <Text style={[styles.label, { color: ui.text }]}>
          Two-Factor Authentication
        </Text>
        <Switch
          value={twoFactorEnabled}
          onValueChange={setTwoFactorEnabled}
          thumbColor={Platform.OS === "android" ? (twoFactorEnabled ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <View style={[styles.row, { borderBottomColor: ui.border }]}>
        <Text style={[styles.label, { color: ui.text }]}>
          Biometric Unlock
        </Text>
        <Switch
          value={biometricUnlock}
          onValueChange={setBiometricUnlock}
          thumbColor={Platform.OS === "android" ? (biometricUnlock ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <Text style={[styles.subHeader, { color: ui.text, marginTop: 24 }]}>
        App Permissions
      </Text>
      <View style={[styles.row, { borderBottomColor: ui.border }]}>
        <Text style={[styles.label, { color: ui.text }]}>
          Location Access
        </Text>
        <Switch
          value={locationPermission}
          onValueChange={setLocationPermission}
          thumbColor={Platform.OS === "android" ? (locationPermission ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <View style={[styles.row, { borderBottomColor: ui.border }]}>
        <Text style={[styles.label, { color: ui.text }]}>
          Camera Access
        </Text>
        <Switch
          value={cameraPermission}
          onValueChange={setCameraPermission}
          thumbColor={Platform.OS === "android" ? (cameraPermission ? "#ff6b00" : "#ccc") : undefined}
          trackColor={{ false: "#767577", true: "#ff6b00" }}
        />
      </View>

      <Text style={[styles.note, { color: ui.textMuted }]}>
        Manage your security preferences and app permissions.
      </Text>
    </ScreenWrapper>
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
