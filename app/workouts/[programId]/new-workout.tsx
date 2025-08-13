// app/(tabs)/workouts/[programId]/new-workout.tsx
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function NewWorkoutScreen() {

  const { ui } = useTheme();
  
  const { programId } = useLocalSearchParams<{ programId?: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Guard: ensure programId is a valid integer
  if (!programId) {
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
      .from("workouts")
      .insert([
        {
          name: name.trim(),
          program_id: programId,
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
    router.replace(`/workouts/${programId}`);
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.innerContainer}
      >
        <View style={[styles.card, { backgroundColor: ui.bg }]}>
          <Text style={[styles.title, { color: ui.text }]}>New Workout</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: ui.textMuted }]}>Workout Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: ui.bg }]}
              placeholder="e.g. Push Day"
              placeholderTextColor={ui.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <Pressable
            style={[styles.button, { backgroundColor: ui.primary }, loading && styles.buttonDisabled]}
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
            <Text style={[styles.cancelText, { color: ui.primary }]}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
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