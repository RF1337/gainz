// app/(tabs)/workouts/[programId]/new-workout.tsx
import { useThemeContext } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function NewWorkoutScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";
  const colors = {
    background: isDark ? "#000" : "#fff",
    card: isDark ? "#1e1e1e" : "#f2f2f2",
    text: isDark ? "#fff" : "#000",
    subText: isDark ? "#aaa" : "#888",
    accent: "#ff6b00",
  };

  const { programId } = useLocalSearchParams<{ programId?: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Guard: ensure programId is a valid integer
  const progNum = programId ? parseInt(programId, 10) : NaN;
  if (isNaN(progNum)) {
    return null;
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Please enter a workout name.");
      return;
    }
    setLoading(true);

    // Ensure user is valid
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      router.replace("/(auth)");
      return;
    }

    // Insert into lowercase table name
    const { error: insertError } = await supabase
      .from("workouttemplate")
      .insert([
        {
          name: name.trim(),
          program_id: progNum,
          order_index: 1, // or calculate based on existing count
        },
      ]);

    if (insertError) {
      console.error("Error creating workout:", insertError);
      alert(`Could not create workout: ${insertError.message || "Unknown error"}`);
      setLoading(false);
      return;
    }

    // Navigate back to program detail
    router.replace(`/workouts/${progNum}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.innerContainer}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>New Workout</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.subText }]}>Workout Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? "#121212" : "#fff", color: colors.text }]}
              placeholder="e.g. Push Day"
              placeholderTextColor={colors.subText}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <Pressable
            style={[styles.button, { backgroundColor: colors.accent }, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Workout</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.cancelContainer}>
            <Text style={[styles.cancelText, { color: colors.accent }]}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
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
  cancelContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
});