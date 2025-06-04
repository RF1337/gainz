// app/(tabs)/workouts/[programId]/[workoutId]/new-exercise.tsx
import { useThemeContext } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ExerciseOption = {
  name: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  defaultSets: number;
  defaultReps: number;
};

export default function NewExerciseScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";
  const colors = {
    background: isDark ? "#000" : "#fff",
    card: isDark ? "#1e1e1e" : "#f2f2f2",
    text: isDark ? "#fff" : "#000",
    subText: isDark ? "#aaa" : "#888",
    accent: "#ff6b00",
  };

  const { programId, workoutId } = useLocalSearchParams<{
    programId?: string;
    workoutId?: string;
  }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const workoutNum = workoutId ? parseInt(workoutId, 10) : NaN;
  if (isNaN(workoutNum)) return null;

  // Each exercise has its own default sets/reps
  const exerciseOptions: ExerciseOption[] = [
    { name: "Bench Press", icon: "barbell", defaultSets: 3, defaultReps: 5 },
    { name: "Squat", icon: "fitness", defaultSets: 3, defaultReps: 5 },
    { name: "Deadlift", icon: "body", defaultSets: 1, defaultReps: 5 },
    { name: "Overhead Press", icon: "enter-outline", defaultSets: 3, defaultReps: 5 },
    { name: "Pull-Up", icon: "man", defaultSets: 3, defaultReps: 8 },
    { name: "Dumbbell Row", icon: "hand-left", defaultSets: 3, defaultReps: 8 },
    { name: "Leg Press", icon: "walk", defaultSets: 3, defaultReps: 10 },
    { name: "Bicep Curl", icon: "walk-outline", defaultSets: 3, defaultReps: 12 },
    { name: "Tricep Extension", icon: "bulb-outline", defaultSets: 3, defaultReps: 12 },
    { name: "Lunge", icon: "clipboard-outline", defaultSets: 3, defaultReps: 10 },
    // Add more with appropriate defaults as needed
  ];

  const createExercise = async (exercise: ExerciseOption) => {
    setLoading(true);
    const { error } = await supabase
      .from("exercisetemplate")
      .insert([{
        name: exercise.name,
        default_sets: exercise.defaultSets,
        default_reps: exercise.defaultReps,
        workout_template_id: workoutNum,
        order_index: 1, // you can calculate next index later
      }]);
    if (error) {
      console.error("Error creating exercise:", error);
      alert(`Could not create exercise: ${error.message}`);
      setLoading(false);
      return;
    }
    router.replace(`/workouts/${programId}/${workoutId}`);
  };

  const renderItem = ({ item }: { item: ExerciseOption }) => (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => createExercise(item)}
    >
      <Ionicons name={item.icon} size={36} color={colors.accent} />
      <Text style={[styles.cardText, { color: colors.text }]}>
        {item.name}
      </Text>
      <Text style={[styles.subText, { color: colors.subText }]}>
        {item.defaultSets}×{item.defaultReps}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.header, { color: colors.text }]}>
        Select Exercise
      </Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={exerciseOptions}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Pressable onPress={() => router.back()} style={styles.cancelContainer}>
        <Text style={[styles.cancelText, { color: colors.accent }]}>
          Cancel
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
  },
  cancelContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});