// app/(tabs)/workouts/[programId]/index.tsx
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

type WorkoutTemplate = {
  id: number;
  name: string;
  order_index: number;
};

export default function ProgramDetailScreen() {
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

  const progNum = programId ? parseInt(programId, 10) : NaN;
  if (isNaN(progNum)) return null;

  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("workouttemplate")
        .select("id, name, order_index")
        .eq("program_id", progNum)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching workouts:", error.message);
        setWorkouts([]);
      } else {
        setWorkouts((data as WorkoutTemplate[]) || []);
      }
      setLoading(false);
    };
    fetchWorkouts();
  }, [progNum]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: WorkoutTemplate }) => (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/workouts/${programId}/${item.id}`)}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        {item.name}
      </Text>
    </Pressable>
  );

  const ListFooter = () => (
    <Pressable
      style={[styles.addButton, { backgroundColor: colors.accent }]}
      onPress={() => router.push(`/workouts/${programId}/new-workout`)}
    >
      <Text style={[styles.addButtonText, { color: "#fff" }]}>
        + Add Workout
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.header, { color: colors.text }]}>Workouts</Text>

      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            No workouts in this program.
          </Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push(`/workouts/${programId}/new-workout`)}
          >
            <Text style={[styles.addButtonText, { color: "#fff" }]}>
              + Add Workout
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={ListFooter}
        />
      )}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
});