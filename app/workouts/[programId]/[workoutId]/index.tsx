// app/(tabs)/workouts/[programId]/[workoutId]/index.tsx

import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

type ExerciseTemplate = {
  id: number;
  name: string;
  default_sets: number;
  default_reps: number;
  order_index: number;
};

export default function WorkoutDetailScreen() {
  const { ui } = useTheme();

  const { programId, workoutId } = useLocalSearchParams<{
    programId?: string;
    workoutId?: string;
  }>();
  const router = useRouter();

  // Don't parse to number because ID is UUID string
  if (!workoutId || typeof workoutId !== "string") return null;

  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutName, setWorkoutName] = useState("Workout");

  // Keep track of open Swipeable rows so only one is open at a time
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  useEffect(() => {
    const fetchWorkoutAndExercises = async () => {
      setLoading(true);

      if (!workoutId || typeof workoutId !== "string") {
        console.error("Invalid workoutId");
        setLoading(false);
        return;
      }

      // Fetch workout name
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select("name")
        .eq("id", workoutId)  // use workoutId string here
        .single();

      if (workoutError) {
        console.error("Error fetching workout name:", workoutError.message);
      } else if (workoutData?.name) {
        setWorkoutName(workoutData.name);
      }

      // Fetch exercises for this workout template
// Fetch exercises for this workout template
const { data, error } = await supabase
  .from("workout_exercises")
  .select(`
    id,
    default_sets,
    default_reps,
    order_index,
    exercise:exercise_id (
      name
    )
  `)
  .eq("workout_id", workoutId)
  .order("order_index", { ascending: true });

if (error) {
  console.error("Error fetching exercises:", error.message);
  setExercises([]);
} else if (data) {
  // Map data to match ExerciseTemplate type:
  const exercisesMapped: ExerciseTemplate[] = data.map((item: any) => ({
    id: item.id,
    default_sets: item.default_sets,
    default_reps: item.default_reps,
    order_index: item.order_index,
    name: item.exercise?.name || "Unnamed exercise",
  }));
  setExercises(exercisesMapped);
}


      setLoading(false);
    };

    fetchWorkoutAndExercises();
  }, [workoutId]);

  const deleteExercise = async (exerciseId: number) => {
    try {
      const { error } = await supabase
        .from("exercise_templates")
        .delete()
        .eq("id", exerciseId);

      if (error) throw error;
      setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not delete exercise.");
    }
  };

  const renderRightActions = (
    _progress: any,
    item: ExerciseTemplate
  ) => (
    <Pressable
      style={[styles.deleteButton, { backgroundColor: "#dc3545" }]}
      onPress={() => {
        const ref = swipeableRefs.current.get(item.id);
        ref?.close();
        Alert.alert(
          "Delete Exercise",
          `Are you sure you want to delete "${item.name}"?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteExercise(item.id),
            },
          ]
        );
      }}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </Pressable>
  );

  const renderItem = ({ item }: { item: ExerciseTemplate }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) swipeableRefs.current.set(item.id, ref);
      }}
      friction={2}
      rightThreshold={40}
      renderRightActions={(progress) => renderRightActions(progress, item)}
      onSwipeableWillOpen={() => {
        swipeableRefs.current.forEach((ref, key) => {
          if (key !== item.id) ref.close();
        });
      }}
    >
      <View style={[styles.card, { backgroundColor: ui.bg }]}>
        <Text style={[styles.exerciseName, { color: ui.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.setsReps, { color: ui.textMuted }]}>
          {item.default_sets} × {item.default_reps}
        </Text>
      </View>
    </Swipeable>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: ui.bgDark }]}>
        <ActivityIndicator size="large" color={ui.primary} />
      </View>
    );
  }

  const ListHeader = () => (
    <Pressable
      style={[styles.logButton, { backgroundColor: ui.primary }]}
      onPress={() => router.push(`/workouts/${programId}/${workoutId}/log`)}
    >
      <Text style={[styles.logButtonText, { color: "#fff" }]}>Start workout</Text>
    </Pressable>
  );

  const ListFooter = () => (
    <Pressable
      style={[styles.addButton, { backgroundColor: ui.primary }]}
      onPress={() =>
        router.push(`/workouts/${programId}/${workoutId}/new-exercise`)
      }
    >
      <Text style={[styles.addButtonText, { color: "#fff" }]}>
        Add Exercise
      </Text>
    </Pressable>
  );

  if (exercises.length === 0) {
    return (
      <ScreenWrapper>
        <Text style={[styles.emptyText, { color: ui.textMuted }]}>
          No exercises in this workout.
        </Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: ui.primary }]}
          onPress={() =>
            router.push(`/workouts/${programId}/${workoutId}/new-exercise`)
          }
        >
          <Text style={[styles.addButtonText, { color: "#fff" }]}>
            Add Exercise
          </Text>
        </Pressable>
      </ScreenWrapper>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenWrapper scroll={false}>
        <Header leftIcon={<BackButton />} title={`${workoutName}`} />
        <Text style={[styles.header, { color: ui.text }]}>Exercises</Text>
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.listContent}
        />
      </ScreenWrapper>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
  },
  listContent: {
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
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logButtonText: { fontSize: 16, fontWeight: "600" },
  addButton: {
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
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginVertical: 8,
    borderRadius: 12,
  },
});
