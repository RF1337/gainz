// app/(tabs)/workouts/new-program.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput
} from "react-native";

export default function NewProgramScreen() {
  const ui = useTheme();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Please enter a program name.");
      return;
    }
    setLoading(true);

    // 1) Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("No user session:", userError?.message);
      router.replace("/(auth)");
      return;
    }

    // 2) Insert into Program table
    const { error: insertError } = await supabase
      .from("programs")
      .insert([{ name: name.trim(), user_id: user.id }]);

    if (insertError) {
      console.error("Error creating program:", insertError.message);
      alert("Could not create program. Try again.");
      setLoading(false);
      return;
    }

    // 3) Navigate back to the program list
    router.replace("/workouts"); // this will refresh the list
  };

  return (
      <ScreenWrapper>
        <Text style={styles.label}>Program Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. PPL Strength Cycle"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Program</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 16, alignItems: "center" }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  form: {
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff6b00",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: "#ff6b00",
    fontSize: 16,
    fontWeight: "500",
  },
});