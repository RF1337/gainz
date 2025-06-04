// app/(tabs)/workouts/[programId]/[workoutId]/index.tsx
import { useThemeContext } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type ExerciseTemplate = {
  id: number;
  name: string;
  default_sets: number;
  default_reps: number;
  order_index: number;
};

export default function WorkoutDetailScreen() {
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

  // parse workoutId as integer, bail if invalid
  const workoutNum = workoutId ? parseInt(workoutId, 10) : NaN;
  if (isNaN(workoutNum)) return null;

  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("exercisetemplate")
        .select("id, name, default_sets, default_reps, order_index")
        .eq("workout_template_id", workoutNum)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching exercises:", error.message);
        setExercises([]);
      } else {
        setExercises((data as ExerciseTemplate[]) || []);
      }
      setLoading(false);
    };
    fetchExercises();
  }, [workoutNum]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // “Log Workout” button at top
  const ListHeader = () => (
    <Pressable
      style={[styles.logButton, { backgroundColor: colors.accent }]}
      onPress={() => router.push(`/workouts/${programId}/${workoutId}/log`)}
    >
      <Text style={[styles.logButtonText, { color: "#fff" }]}>▶ Log Workout</Text>
    </Pressable>
  );

  // “Add Exercise” button at bottom
  const ListFooter = () => (
    <Pressable
      style={[styles.addButton, { backgroundColor: colors.accent }]}
      onPress={() =>
        router.push(`/workouts/${programId}/${workoutId}/new-exercise`)
      }
    >
      <Text style={[styles.addButtonText, { color: "#fff" }]}>
        + Add Exercise
      </Text>
    </Pressable>
  );

  // If no exercises, show empty state + add button
  if (exercises.length === 0) {
    return (
      <SafeAreaView
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.emptyText, { color: colors.subText }]}>
          No exercises in this workout.
        </Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={() =>
            router.push(`/workouts/${programId}/${workoutId}/new-exercise`)
          }
        >
          <Text style={[styles.addButtonText, { color: "#fff" }]}>
            + Add Exercise
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Render each exercise in a styled card
  const renderItem = ({ item }: { item: ExerciseTemplate }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.exerciseName, { color: colors.text }]}>
        {item.name}
      </Text>
      <Text style={[styles.setsReps, { color: colors.subText }]}>
        {item.default_sets} × {item.default_reps}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.header, { color: colors.text }]}>Exercises</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  exerciseName: { fontSize: 18, fontWeight: "600" },
  setsReps: { fontSize: 14, marginTop: 4 },
  logButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logButtonText: { fontSize: 16, fontWeight: "600" },
  addButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { fontSize: 16, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
});