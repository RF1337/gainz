// app/(tabs)/workout-logs.tsx

import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

type WorkoutLogRow = {
  id: number;
  performed_on: string;
  workouttemplate: { name: string } | null;
};

type ExerciseLogRow = {
  exercise_templates_id: { name: string } | null;
  set_number: number;
  reps_performed: number;
  weight_used: number;
  is_warmup: boolean;
};

type CombinedLog = {
  workout: WorkoutLogRow;
  entries: ExerciseLogRow[];
};

export default function WorkoutLogsScreen() {
  const { ui } = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState<CombinedLog[]>([]);
  const [loading, setLoading] = useState(true);

  const changeDate = (offset: number) => {
    setSelectedDate((prev) => {
      const nxt = new Date(prev);
      nxt.setDate(prev.getDate() + offset);
      return nxt;
    });
  };

  useEffect(() => {
    fetchLogsForDate(selectedDate);
  }, [selectedDate]);

  async function fetchLogsForDate(date: Date) {
    setLoading(true);
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from("workout_logs")
        .select("id, performed_on, workout_templates(name)")
        .order("performed_on", { ascending: true });

      if (workoutError) throw workoutError;
      const workoutRows = (workoutData as unknown) as WorkoutLogRow[];

      if (!workoutRows || workoutRows.length === 0) {
        setLogs([]);
        setLoading(false);
        return;
      }

      const targetY = date.getFullYear();
      const targetM = date.getMonth();
      const targetD = date.getDate();

      const filtered = workoutRows.filter((wl) => {
        const performed = new Date(wl.performed_on);
        return (
          performed.getFullYear() === targetY &&
          performed.getMonth() === targetM &&
          performed.getDate() === targetD
        );
      });

      if (filtered.length === 0) {
        setLogs([]);
        setLoading(false);
        return;
      }

      const combined: CombinedLog[] = [];
      for (const workout of filtered) {
        const { data: entriesData, error: entriesError } = await supabase
          .from("exercise_logs")
          .select(
            "exercise_template_id(name), set_number, reps_performed, weight_used, is_warmup"
          )
          .eq("workout_log_id", workout.id)
          .order("set_number", { ascending: true });

        if (entriesError) throw entriesError;
        const entryRows = (entriesData as unknown) as ExerciseLogRow[];
        combined.push({ workout, entries: entryRows || [] });
      }

      setLogs(combined);
    } catch (err: any) {
      console.error("Error fetching logs:", err.message);
      Alert.alert("Error", "Could not load workout logs.");
    } finally {
      setLoading(false);
    }
  }

  const renderExercise = (entry: ExerciseLogRow) => {
    const borderColor = entry.is_warmup ? "#999900" : ui.primary;
    return (
      <View style={[styles.entryRow, { borderLeftColor: borderColor }]}>
        <Text style={[styles.entryText, { color: ui.text }]}>
          {entry.exercise_templates_id?.name ?? "Unknown"}
        </Text>
        <Text style={[styles.entryText, { color: ui.textMuted }]}>
          Set {entry.set_number}: {entry.reps_performed} reps @ {entry.weight_used} lbs{" "}
          {entry.is_warmup ? "(WU)" : ""}
        </Text>
      </View>
    );
  };

  const renderWorkout = ({ item }: { item: CombinedLog }) => {
    const performed = new Date(item.workout.performed_on);
    const timeString = performed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={[styles.card, { backgroundColor: ui.bg }]}>
        <View style={styles.workoutHeader}>
          <Text style={[styles.workoutTitle, { color: ui.text }]}>
            {item.workout.workouttemplate?.name ?? "Unnamed Workout"}
          </Text>
          <Text style={[styles.workoutTime, { color: ui.textMuted }]}>
            {timeString}
          </Text>
        </View>
        {item.entries.map((e, idx) => (
          <View key={idx}>{renderExercise(e)}</View>
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper scroll={false}>
      <Header 
      leftIcon={<BackButton />}
      title="Workout logs"
      />
        <View style={styles.dateControls}>
          <Pressable onPress={() => changeDate(-1)} style={styles.navButton}>
            <Text style={[styles.navButtonText, { color: ui.primary }]}>‹</Text>
          </Pressable>
          <Text style={[styles.dateLabel, { color: ui.text }]}>
            {selectedDate.toDateString()}
          </Text>
          <Pressable onPress={() => changeDate(1)} style={styles.navButton}>
            <Text style={[styles.navButtonText, { color: ui.primary }]}>›</Text>
          </Pressable>
        </View>

      {loading ? (
        <View style={[styles.centered, { backgroundColor: ui.bgDark }]}>
          <ActivityIndicator size="large" color={ui.primary} />
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ui.textMuted }]}>
            No workouts logged on this date.
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.workout.id.toString()}
          renderItem={renderWorkout}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: "#fff" }]} />
          )}
        />
      )}
</ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerText: { fontSize: 24, fontWeight: "700" },
  dateControls: { flexDirection: "row", justifyContent: "center" },
  navButton: { paddingHorizontal: 12, paddingVertical: 4 },
  navButtonText: { fontSize: 24 },
  dateLabel: { fontSize: 16, fontWeight: "600", marginHorizontal: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, textAlign: "center" },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  separator: { height: 1, marginVertical: 8 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  workoutHeader: { flexDirection: "row", justifyContent: "space-between" },
  workoutTitle: { fontSize: 18, fontWeight: "600" },
  workoutTime: { fontSize: 14, marginTop: 4 },
  entryRow: {
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    flexDirection: "column",
    marginVertical: 4,
  },
  entryText: { fontSize: 14 },
});
