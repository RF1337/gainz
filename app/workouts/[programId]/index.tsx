// app/(tabs)/workouts/[programId]/index.tsx

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
  View,
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

type WorkoutTemplate = {
  id: number;
  name: string;
  order_index: number;
};

// Simple UUID v4 validation (basic)
const isValidUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export default function ProgramDetailScreen() {
  const { ui } = useTheme();
  const { programId } = useLocalSearchParams<{ programId?: string }>();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState<string>("");

  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/(auth)");
        return;
      }

      if (!programId || !isValidUuid(programId)) {
        Alert.alert("Invalid Program ID", "The program ID is not valid.");
        router.replace("/"); // or wherever you want to redirect
        return;
      }

      try {
        // Fetch program name
        const { data: programData, error: programError } = await supabase
          .from("programs")
          .select("name")
          .eq("id", programId)
          .single();

        if (programError) throw programError;
        if (programData?.name) setProgramName(programData.name);

        // Fetch workouts
        const { data: workoutData, error: workoutError } = await supabase
          .from("workouts")
          .select("id, name, order_index")
          .eq("program_id", programId)
          .order("order_index", { ascending: true });

        if (workoutError) throw workoutError;
        setWorkouts((workoutData as WorkoutTemplate[]) || []);
      } catch (error: any) {
        Alert.alert("Error fetching data", error.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programId, router]);

  const deleteWorkout = async (workoutId: number) => {
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);
      if (error) throw error;
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not delete workout.");
    }
  };

  const renderRightActions = (_: any, item: WorkoutTemplate) => (
    <Pressable
      style={[styles.deleteButton, { backgroundColor: "#dc3545" }]}
      onPress={() => {
        const ref = swipeableRefs.current.get(item.id);
        ref?.close();
        Alert.alert(
          "Delete Workout",
          `Are you sure you want to delete "${item.name}"?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteWorkout(item.id),
            },
          ]
        );
      }}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </Pressable>
  );

  const renderItem = ({ item }: { item: WorkoutTemplate }) => (
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
      <Pressable
        style={[styles.card]}
        onPress={() => router.push(`/workouts/${programId}/${item.id}`)}
      >
        <View style={styles.cardRow}>
          <View style={[styles.iconBox, { backgroundColor: "#6C5CE7" }]}>
            <Ionicons name="barbell-outline" size={24} color="#fff" />
          </View>
          <Text style={[styles.cardTitle, { color: ui.text }]}>{item.name}</Text>
        </View>
      </Pressable>
    </Swipeable>
  );

  const renderHeader = () => (
    <Pressable
      style={[styles.card]}
      onPress={() => router.push(`/workouts/${programId}/new-workout`)}
    >
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, { backgroundColor: ui.primary }]}>
          <Ionicons name="add" size={28} color="#fff" />
        </View>
        <Text style={[styles.cardTitle, { color: ui.text }]}>Create workout</Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: ui.bgDark }]}>
        <ActivityIndicator size="large" color={ui.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenWrapper scroll={false}>
        <Header leftIcon={<BackButton />} title={programName} />

        {workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: ui.textMuted }]}>
              No workouts in this program.
            </Text>
            {renderHeader()}
          </View>
        ) : (
          <FlatList
            data={workouts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
          />
        )}
      </ScreenWrapper>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
