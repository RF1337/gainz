// app/(tabs)/workouts/[programId]/[workoutId]/log.tsx

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList, Pressable, Swipeable } from "react-native-gesture-handler";

import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";

const { width: screenWidth } = Dimensions.get("window");

type ExerciseTemplate = {
  id: number;
  exercise_id: string;
  name: string;
  default_sets: number;
  default_reps: number;
  order_index: number;
};

type ExerciseLogEntry = {
  weight: string;
  reps: string;
  isWarmup: boolean;
  completed: boolean;
};

const EnhancedButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "success";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: any;
}> = ({ title, onPress, variant = "primary", disabled, loading, icon, style }) => {
  const { ui } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[styles.enhancedButton, disabled && { opacity: 0.6 }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color={ui.text} />
        ) : (
          <View style={styles.buttonContent}>
            {icon && (
              <Ionicons
                name={icon as any}
                size={20}
                color={ui.text}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={[styles.buttonText, { color: ui.text }]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const EnhancedInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  width?: number;
  keyboardType?: "numeric" | "default";
  suffix?: string;
}> = ({
  value,
  onChangeText,
  placeholder,
  width = 70,
  keyboardType = "numeric",
  suffix,
}) => {
  const { ui } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ width }]}>
      <TextInput
        style={[
          styles.enhancedInput,
          { borderColor: isFocused ? ui.text : ui.border, color: ui.text },
        ]}
        placeholder={placeholder}
        placeholderTextColor={ui.textMuted + "80"}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectTextOnFocus
      />
      {suffix && value && (
        <Text style={[styles.inputSuffix, { color: ui.textMuted }]}>{suffix}</Text>
      )}
    </View>
  );
};

const ProgressIndicator: React.FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const { ui } = useTheme();
  const progress = total > 0 ? completed / total : 0;

  return (
    <View style={styles.progressContainer}>
      <View
        style={[styles.progressBar, { backgroundColor: ui.textMuted + "20" }]}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: ui.primary },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: ui.textMuted }]}>
        {completed}/{total} sets completed
      </Text>
    </View>
  );
};

export default function WorkoutLogScreen() {
  const { ui } = useTheme();
  const { programId, workoutId } =
    useLocalSearchParams<{ programId: string; workoutId: string }>();
  const router = useRouter();

  const [exTemplates, setExTemplates] = useState<ExerciseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionExercises, setSessionExercises] = useState<
    Record<number, string>
  >({});
  const [logs, setLogs] = useState<Record<number, ExerciseLogEntry[]>>({});
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const restTimeLeftRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Error", "User not authenticated.");
        router.back();
        return;
      }

      // 1. create workout_session
      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert([{ workout_id: workoutId, user_id: user.id }])
        .select("id")
        .single();

      if (sessionError || !session) {
        console.error("Error creating workout session:", sessionError?.message);
        router.back();
        return;
      }
      setSessionId(session.id);

      // 2. fetch workout_exercises
      const { data: exData, error: exError } = await supabase
        .from("workout_exercises")
        .select("id, exercise_id, default_sets, default_reps, order_index, exercises(name)")
        .eq("workout_id", workoutId)
        .order("order_index", { ascending: true });

      if (exError || !exData) {
        console.error("Error fetching workout_exercises:", exError?.message);
        setLoading(false);
        return;
      }

      // 3. create workout_session_exercises
      const toInsert = exData.map((ex) => ({
        workout_session_id: session.id,
        workout_exercise_id: ex.id,
        exercise_id: ex.exercise_id,
        position: ex.order_index,
      }));

      const { data: sessionExData, error: sessionExError } = await supabase
        .from("workout_session_exercises")
        .insert(toInsert)
        .select("id, workout_exercise_id");

      if (sessionExError || !sessionExData) {
        console.error("Error creating session exercises:", sessionExError?.message);
        setLoading(false);
        return;
      }

      const exMap: Record<number, string> = {};
      sessionExData.forEach((row) => {
        exMap[row.workout_exercise_id] = row.id;
      });
      setSessionExercises(exMap);

      // init logs
      const initLogs: Record<number, ExerciseLogEntry[]> = {};
      exData.forEach((ex) => {
        initLogs[ex.id] = Array(ex.default_sets)
          .fill(0)
          .map(() => ({
            weight: "",
            reps: "",
            isWarmup: false,
            completed: false,
          }));
      });
      setExTemplates(
        exData.map((ex) => ({
          ...ex,
          name: (ex as any).exercises.name,
        }))
      );
      setLogs(initLogs);
      setLoading(false);
    };

    initialize();
  }, [workoutId]);

  const updateLogEntry = (
    exId: number,
    setIdx: number,
    field: "weight" | "reps",
    value: string
  ) => {
    setLogs((prev) => {
      const updated = [...(prev[exId] || [])];
      updated[setIdx] = { ...updated[setIdx], [field]: value };
      return { ...prev, [exId]: updated };
    });
  };

  const toggleSetCompletion = (exId: number, setIdx: number) => {
    setLogs((prev) => {
      const updated = [...(prev[exId] || [])];
      const currentSet = updated[setIdx];
      updated[setIdx] = { ...currentSet, completed: !currentSet.completed };
      return { ...prev, [exId]: updated };
    });
  };

  const toggleWarmup = (exId: number, setIdx: number) => {
    setLogs((prev) => {
      const updated = [...(prev[exId] || [])];
      updated[setIdx] = { ...updated[setIdx], isWarmup: !updated[setIdx].isWarmup };
      return { ...prev, [exId]: updated };
    });
  };

  const deleteSet = (exId: number, setIdx: number) => {
    setLogs((prev) => {
      const updated = [...(prev[exId] || [])];
      updated.splice(setIdx, 1);
      return { ...prev, [exId]: updated };
    });
  };

  const addSet = (exId: number) => {
    setLogs((prev) => {
      const existing = prev[exId] || [];
      return {
        ...prev,
        [exId]: [
          ...existing,
          { weight: "", reps: "", isWarmup: false, completed: false },
        ],
      };
    });
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    setLoading(true);

    const setRows = Object.entries(logs).flatMap(([workoutExIdStr, entries]) => {
      const workoutExId = Number(workoutExIdStr);
      const sessionExId = sessionExercises[workoutExId];
      if (!sessionExId) return [];

      return entries.map((entry, idx) => ({
        workout_session_exercise_id: sessionExId,
        set_number: idx + 1,
        weight_kg: entry.weight ? parseFloat(entry.weight) : null,
        reps: entry.reps ? parseInt(entry.reps, 10) : null,
        rir: null,
        note: null,
      }));
    });

    const { error } = await supabase
      .from("workout_session_sets")
      .insert(setRows);

    if (error) {
      console.error("Error saving sets:", error.message);
      Alert.alert("Error", "Failed to save workout.");
      setLoading(false);
      return;
    }

    router.replace(`/workouts/${programId}/${workoutId}`);
  };

  const progress = (() => {
    const allSets = Object.values(logs).flat();
    const completedSets = allSets.filter((s) => s.completed).length;
    return { completed: completedSets, total: allSets.length };
  })();

  if (loading || sessionId === null) {
    return (
      <View style={[styles.centered, { backgroundColor: ui.bgDark }]}>
        <ActivityIndicator size="large" color={ui.primary} />
        <Text style={[styles.loadingText, { color: ui.textMuted }]}>
          Loading workout...
        </Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <Header leftIcon={<BackButton />} title={""} />
      <ProgressIndicator completed={progress.completed} total={progress.total} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <FlatList
          data={exTemplates}
          keyExtractor={(ex) => ex.id.toString()}
          renderItem={({ item: ex, index: exerciseIndex }) => (
            <View style={styles.exerciseCard}>
              <View style={styles.exerciseInfo}>
                <View style={styles.exerciseHeader}>
                  <Text
                    style={[styles.exerciseTitle, { color: ui.text }]}
                  >
                    {ex.name}
                  </Text>
                  <View
                    style={[
                      styles.exerciseBadge,
                      { backgroundColor: ui.textMuted + "20" },
                    ]}
                  >
                    <Text
                      style={[styles.exerciseBadgeText, { color: ui.textMuted }]}
                    >
                      {logs[ex.id]?.filter((s) => s.completed).length || 0}/
                      {logs[ex.id]?.length || 0}
                    </Text>
                  </View>
                </View>
              </View>

              <FlatList
                data={logs[ex.id] || []}
                keyExtractor={(_, idx) => `${ex.id}-${idx}`}
                renderItem={({ item: entry, index: idx }) => {
                  const nonWarmCount = logs[ex.id]
                    .slice(0, idx + 1)
                    .filter((e) => !e.isWarmup).length;
                  const displayNumber = entry.isWarmup ? "W" : String(nonWarmCount);

                  return (
                    <Swipeable
                      renderRightActions={() => (
                        <Pressable
                          onPress={() => deleteSet(ex.id, idx)}
                          style={{ backgroundColor: "red", justifyContent: "center" }}
                        >
                          <Text style={{ color: "white", padding: 16 }}>Delete</Text>
                        </Pressable>
                      )}
                      renderLeftActions={() => (
                        <Pressable
                          onPress={() => toggleWarmup(ex.id, idx)}
                          style={{ backgroundColor: "orange", justifyContent: "center" }}
                        >
                          <Text style={{ color: "white", padding: 16 }}>Warmup</Text>
                        </Pressable>
                      )}
                    >
                      <View
                        style={[
                          styles.setRow,
                          {
                            backgroundColor: entry.completed
                              ? ui.primary
                              : ui.bgDark,
                          },
                        ]}
                      >
                        <View style={{ alignItems: "center", width: 40 }}>
                          <Text style={[styles.label, { color: ui.textMuted }]}>Set</Text>
                          <Text style={[styles.setNumber, { color: ui.text }]}>
                            {displayNumber}
                          </Text>
                        </View>
                        <View style={{ alignItems: "center", width: 70 }}>
                          <Text style={[styles.label, { color: ui.textMuted }]}>Weight</Text>
                          <EnhancedInput
                            value={entry.weight}
                            onChangeText={(t) => updateLogEntry(ex.id, idx, "weight", t)}
                            width={70}
                            suffix="kg"
                            placeholder="0"
                          />
                        </View>
                        <View style={{ alignItems: "center", width: 70 }}>
                          <Text style={[styles.label, { color: ui.textMuted }]}>Reps</Text>
                          <EnhancedInput
                            value={entry.reps}
                            onChangeText={(t) => updateLogEntry(ex.id, idx, "reps", t)}
                            width={70}
                            placeholder="0"
                          />
                        </View>
                        <View style={{ alignItems: "center", width: 50 }}>
                          <Text style={[styles.label, { color: ui.textMuted }]}>Done</Text>
                          <TouchableOpacity
                            style={[
                              styles.setCheckbox,
                              {
                                backgroundColor: entry.completed
                                  ? ui.primary
                                  : "transparent",
                              },
                            ]}
                            onPress={() => toggleSetCompletion(ex.id, idx)}
                          >
                            {entry.completed && (
                              <Ionicons name="checkmark" size={16} color="#FFF" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Swipeable>
                  );
                }}
              />
              <EnhancedButton
                title="Add Set"
                onPress={() => addSet(ex.id)}
                variant="secondary"
                style={{ borderWidth: 1, borderColor: ui.border, borderRadius: 25 }}
              />
            </View>
          )}
          ListFooterComponent={
            <View style={styles.finishContainer}>
              <EnhancedButton
                title="Finish Workout"
                onPress={handleSubmit}
                variant="success"
                loading={loading}
                icon="checkmark-circle"
                style={styles.finishButton}
              />
            </View>
          }
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16 },
  progressContainer: { alignItems: "center" },
  progressBar: {
    width: screenWidth - 32,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { marginTop: 8, fontSize: 14, fontWeight: "500" },
  exerciseCard: { marginBottom: 24 },
  exerciseHeader: { flexDirection: "row", justifyContent: "space-between" },
  exerciseInfo: { flex: 1 },
  exerciseTitle: { fontSize: 18, fontWeight: "700" },
  exerciseBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  exerciseBadgeText: { fontSize: 14, fontWeight: "600" },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderWidth: 1,
  },
  setCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumber: { fontSize: 16, fontWeight: "600" },
  label: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  enhancedButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    marginVertical: 8,
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
  buttonContent: { flexDirection: "row", alignItems: "center" },
  enhancedInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlign: "center",
  },
  inputSuffix: { position: "absolute", right: 8, top: 12, fontSize: 12 },
  finishContainer: { marginTop: 32 },
  finishButton: { marginHorizontal: 32 },
});