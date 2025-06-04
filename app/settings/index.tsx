import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { supabase } from "@/lib/supabase";
import { setGoal } from '@/services/goalsService';
import { router } from "expo-router";

export default function SettingsScreen() {
  const { scheme, toggleScheme } = useThemeContext();
  const isDark = scheme === "dark";

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stepGoal, setStepGoal] = useState("10000");

  const handleStepGoalChange = async (text: string) => {
    setStepGoal(text);
    await setGoal('stepGoal', text);
  };

  const handleClearData = () => {
    Alert.alert("Confirm", "Are you sure you want to clear all data?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => console.log("Data cleared") },
    ]);
  };

  async function doLogout() {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Logout failed', error.message);
      } else {
        router.replace('/(auth)');
      }
    }

  const handleLogout = () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", style: "destructive", onPress: () => doLogout() },
    ]);
  };

  return (
  <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView style={{ paddingHorizontal: 20 }}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>Settings & privacy</Text>

        {/* --- ACCOUNT --- */}
        <Text style={[styles.sectionHeader, { color: isDark ? "#aaa" : "#666" }]}>Account</Text>
        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="person-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Profile</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/profile')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>
        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Privacy</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/privacy')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>
        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="key-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Security & Permissions</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/security')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>

        {/* --- CONTENT AND DISPLAY --- */}
        <Text style={[styles.sectionHeader, { color: isDark ? "#aaa" : "#666" }]}>Content & Display</Text>

        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="notifications-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Notifications</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/notifications')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>

        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="trophy-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Goals</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/goals')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>

        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="swap-horizontal-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Units</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/goals')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>

        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="language-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Language</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/goals')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>

        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="moon-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Dark Mode</Text>
          </View>
          <Switch value={isDark} onValueChange={toggleScheme} />
        </View>

        {/* --- CACHE --- */}
        <Text style={[styles.sectionHeader, { color: isDark ? "#aaa" : "#666" }]}>Cache</Text>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
          <Text style={styles.clearText}>Clear Data</Text>
        </TouchableOpacity>




        {/* --- SUPPORT & ABOUT --- */}
        <Text style={[styles.sectionHeader, { color: isDark ? "#aaa" : "#666" }]}>Support & About</Text>
        {/*Report a problem*/}
        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="flag-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Report a problem</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/report')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>
        {/*Terms and Policies*/}
        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="document-text-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Terms and Policies</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/tos')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>
        {/*FAQ*/}
        <View style={styles.row}>
          <View style={{flexDirection: 'row'}}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color={isDark ? '#ff6b00' : '#666'} style={{ marginRight: 8 }} />
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>FAQ</Text>
          </View>
        <Pressable onPress={() => router.push('../settings/faq')}>
                  <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#aaa' : '#888'} />
        </Pressable>
        </View>

        {/* --- LOG OUT --- */}
        <Text style={[styles.sectionHeader, { color: isDark ? "#aaa" : "#666" }]}>Login</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleLogout}>
          <Text style={styles.clearText}>Log Out</Text>
        </TouchableOpacity>

        {/* --- APP VERSION --- */}
        <Text style={[styles.version, { color: isDark ? "#aaa" : "#888" }]}>App Version: 1.0.0</Text>
      </ScrollView>
    </TouchableWithoutFeedback> 
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 24,
  },
  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    width: 100,
    textAlign: "center",
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  version: {
    marginTop: 40,
    marginBottom: 100,
    textAlign: "center",
  },
});