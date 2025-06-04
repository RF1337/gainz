// app/(tabs)/workouts/[programId]/[workoutId]/log.tsx
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type ExerciseTemplate = {
  id: number;
  name: string;
  default_sets: number;
  default_reps: number;
  order_index: number;
};

type ExerciseLogEntry = {
  weight: string;
  reps: string;
};

export default function WorkoutLogScreen() {
  const { programId, workoutId } = useLocalSearchParams<{
    programId: string;
    workoutId: string;
  }>();
  const router = useRouter();
  const [exTemplates, setExTemplates] = useState<ExerciseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<number, ExerciseLogEntry[]>>({});

  // 1) On mount: create a new workoutlog and fetch exercise templates
  useEffect(() => {
    const initialize = async () => {
      // Create a new row in workoutlog
      const { data: logData, error: logError } = await supabase
        .from("workoutlog")
        .insert([{ workout_template_id: parseInt(workoutId, 10) }])
        .select("id")
        .single();

      if (logError || !logData) {
        console.error("Error creating workout log:", logError?.message);
        router.back();
        return;
      }
      setSessionId(logData.id);

      // Fetch exercise templates for this workout
      const { data: exData, error: exError } = await supabase
        .from("exercisetemplate")
        .select("id, name, default_sets, default_reps, order_index")
        .eq("workout_template_id", parseInt(workoutId, 10))
        .order("order_index", { ascending: true });

      if (exError) {
        console.error("Error fetching exercise templates:", exError.message);
        setExTemplates([]);
      } else {
        setExTemplates(exData || []);
        // Initialize logs state with default set entries
        const initLogs: Record<number, ExerciseLogEntry[]> = {};
        exData?.forEach((ex) => {
          initLogs[ex.id] = Array(ex.default_sets)
            .fill(0)
            .map(() => ({ weight: "", reps: "" }));
        });
        setLogs(initLogs);
      }

      setLoading(false);
    };

    initialize();
  }, [workoutId]);

  if (loading || sessionId === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  // 2) Update individual set entry
  const updateLogEntry = (
    exId: number,
    setIdx: number,
    field: "weight" | "reps",
    value: string
  ) => {
    setLogs((prev) => {
      const updatedEntries = [...(prev[exId] || [])];
      updatedEntries[setIdx] = {
        ...updatedEntries[setIdx],
        [field]: value,
      };
      return { ...prev, [exId]: updatedEntries };
    });
  };

  // 3) Submit all logs to exerciselog table
  const handleSubmit = async () => {
    if (!sessionId) return;
    setLoading(true);

    // Prepare rows for insertion
    const toInsert = Object.entries(logs).flatMap(([exIdStr, entries]) => {
      const exId = parseInt(exIdStr, 10);
      return entries.map((entry, idx) => ({
        workout_log_id: sessionId,
        exercise_template_id: exId,
        set_number: idx + 1,
        reps_performed: parseInt(entry.reps, 10) || 0,
        weight_used: parseFloat(entry.weight) || 0,
      }));
    });

    const { error: insertError } = await supabase
      .from("exerciselog")
      .insert(toInsert);

    if (insertError) {
      console.error("Error inserting exercise logs:", insertError.message);
      alert("Failed to save workout. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    // Navigate back to the workout detail screen
    router.replace(`/workouts/${programId}/${workoutId}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {exTemplates.map((ex) => (
          <View key={ex.id} style={styles.exerciseBlock}>
            <Text style={styles.exerciseTitle}>{ex.name}</Text>
            {logs[ex.id].map((entry, idx) => (
              <View style={styles.setRow} key={idx}>
                <Text style={styles.setLabel}>Set {idx + 1}:</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Weight"
                  keyboardType="numeric"
                  value={entry.weight}
                  onChangeText={(txt) =>
                    updateLogEntry(ex.id, idx, "weight", txt)
                  }
                />
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={entry.reps}
                  onChangeText={(txt) =>
                    updateLogEntry(ex.id, idx, "reps", txt)
                  }
                />
              </View>
            ))}
          </View>
        ))}

        <View style={{ marginVertical: 24 }}>
          <Button
            title={loading ? "Saving..." : "Finish Workout"}
            onPress={handleSubmit}
            disabled={loading}
            color="#ff6b00"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  exerciseBlock: {
    marginBottom: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  exerciseTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setLabel: { width: 48, fontSize: 16 },
  inputSmall: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: 80,
    marginRight: 12,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
  },
});