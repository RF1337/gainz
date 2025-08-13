// app/(tabs)/progress/weight/new.tsx

import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useThemeContext } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput
} from "react-native";

export default function NewWeightScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";
  const colors = {
    background: isDark ? "#000" : "#fff",
    text: isDark ? "#fff" : "#000",
    subText: isDark ? "#aaa" : "#888",
    accent: "#ff6b00",
    inputBg: isDark ? "#1e1e1e" : "#f2f2f2",
  };

  const router = useRouter();
  const [weight, setWeight] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight) || numericWeight <= 0) {
      Alert.alert("Invalid Weight", "Please enter a valid number greater than 0.");
      return;
    }

    setLoading(true);
    try {
      // 1) Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Not signed in", "Please sign in to log your weight.");
        setLoading(false);
        return;
      }

      // 2) Insert a new weight_log row
      const { error: insertError } = await supabase
        .from("weight_logs")
        .insert([
          {
            user_id: user.id,
            weight: numericWeight,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: user.id,
            weight_kg: numericWeight,
          },
        ]);

      if (upsertError) {
        throw upsertError;
      }

      // 3) On success, go back to index so chart updates
      router.replace("/progress/weight" as any);
    } catch (err: any) {
      console.error("Error inserting weight:", err.message);
      Alert.alert("Error", "Could not save your weight. Please try again.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenWrapper>
        <Header
          title="New Weight"
          leftIcon={<BackButton />}
        />
        <Text style={[styles.label, { color: colors.text }]}>Enter Your Weight</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.subText,
            },
          ]}
          placeholder="e.g. 80.5"
          placeholderTextColor={colors.subText}
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />

        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.accent }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.saveText]}>Save Weight</Text>
          )}
        </Pressable>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 24,
  },
  saveButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 8,
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});