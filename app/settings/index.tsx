import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export default async function SettingsScreen() {
  const { ui } = useTheme();
  
  const handleClearData = () => {
    Alert.alert("Confirm", "Are you sure you want to clear all data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => console.log("Data cleared"),
      },
    ]);
  };

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout failed", error.message);
    } else {
      router.replace("/(auth)");
    }
  };

  const debugOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'false');
  }

  const handleLogout = () => {
  Alert.alert("Confirm", "Are you sure you want to log out?", [
    { text: "Cancel", style: "cancel" },
    { 
      text: "Confirm", 
      style: "destructive", 
      onPress: () => {
        doLogout(); // Your logout logic
        Toast.show({
          type: 'success',
          text1: 'Logged out',
          text2: 'You have been signed out.',
        });
      } 
    },
  ]);
};

  const renderRow = (
    icon: string,
    label: string,
    subLabel: string,
    onPress: () => void,
    options?: { iconColor?: string; showChevron?: boolean }
  ) => (
    <TouchableOpacity style={[styles.row, { borderColor: ui.border }]} onPress={onPress}>
      <View style={styles.rowLabel}>
        <Ionicons
          name={icon as any}
          size={20}
          color={options?.iconColor ?? ui.textMuted}
          style={styles.icon}
        />
        <View>
          <Text style={[styles.label, { color: ui.text }]}>{label}</Text>
          {subLabel.length > 0 && (
            <Text style={[styles.subLabel, { color: ui.textMuted }]}>
              {subLabel}
            </Text>
          )}
        </View>
      </View>
      {options?.showChevron !== false && (
        <Ionicons name="chevron-forward-outline" size={20} color={ui.text} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <Header
        leftIcon={<BackButton />}
        title="Settings"
      />

      {/* Upgrade plan widget */}
      
      <TouchableOpacity>
      <LinearGradient
            colors={["#F09819", "#EDDE5D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.premiumWidget, {borderColor: ui.border}]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
        <View style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 5, // for Android
        }}>
          <Image source={require("../../assets/icons/crown.png")} style={{ width: 60, height: 60 }} />
        </View>
          <View style={{ gap: 12 }}>
            <Text style={[styles.premiumLabel, { color: ui.text }]}>Upgrade Your Plan</Text>
            <Text style={[styles.premiumSubLabel, { color: ui.text, width: "70%" }]}>Enjoy exclusive tools and personalized insights on your journey!</Text>
          </View>
       </View>
      </LinearGradient>
      </TouchableOpacity>

      {/* --- Account --- */}
      <Text style={[styles.sectionHeader, { color: ui.text }]}>Account</Text>
      {renderRow("person-outline", "Profile", "Update your display name and profile info", () => router.push("../settings/profile"))}
      {renderRow("lock-closed-outline", "Privacy", "Control what info is visible to others", () => router.push("../settings/privacy"))}
      {renderRow("key-outline", "Security & Permissions", "Manage passwords and app permissions", () => router.push("../settings/security"))}

      {/* --- Content & Display --- */}
      <Text style={[styles.sectionHeader, { color: ui.text }]}>Content & Display</Text>
      {renderRow("notifications-outline", "Notifications", "Manage which notifications you want to receive", () => router.push("../settings/notifications"))}
      {renderRow("trophy-outline", "Goals", "Set your fitness and nutrition goals", () => router.push("../settings/goals"))}
      {renderRow("swap-horizontal-outline", "Units", "Choose your preferred measurement units", () => router.push("../settings/units"))}
      {renderRow("language-outline", "Language", "Change the language used in the app", () => router.push("../settings/language"))}
      {renderRow("moon-outline", "Theme", "Switch between light and dark modes", () => router.push("../settings/theme"))}

      {/* --- Cache --- */}
      <Text style={[styles.sectionHeader, { color: ui.text }]}>Cache</Text>
      {renderRow("trash-outline", "Clear data", "Delete all local app data and reset state", handleClearData, {})}

      {/* --- Support & About --- */}
      <Text style={[styles.sectionHeader, { color: ui.text }]}>Support & About</Text>
      {renderRow("flag-outline", "Report a problem", "Something not working? Let us know", () => router.push("../settings/report"))}
      {renderRow("document-text-outline", "Terms & Policies", "Review our policies and terms of use", () => router.push("../settings/tos"))}
      {renderRow("chatbox-ellipses-outline", "FAQ", "Find answers to common questions", () => router.push("../settings/faq"))}

      {/* --- Login --- */}
      <Text style={[styles.sectionHeader, { color: ui.text }]}>Login</Text>
      {renderRow("exit-outline", "Log out", "Sign out of your account", handleLogout, {})}

      {/* --- Version --- */}
      <Pressable onPress={debugOnboarding}>
        <Text style={[styles.version, { color: ui.text }]}>Test onboarding</Text>
      </Pressable>
      {/* --- Version --- */}
      <Text style={[styles.version, { color: ui.text }]}>App Version: 1.0.0</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 24,
  },
  row: {
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginVertical: 4,
  },
  rowLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  subLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  version: {
    marginTop: 40,
    textAlign: "center",
  },
  premiumWidget: {
    padding: 16,
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  premiumLabel: {
    fontSize: 24,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  premiumSubLabel: {
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});