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
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';


import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";

const { width: screenWidth } = Dimensions.get('window');

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
  isWarmup: boolean;
  completed: boolean;
};

// Enhanced Button Component
const EnhancedButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: any;
}> = ({ title, onPress, variant = 'primary', disabled, loading, icon, style }) => {
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
        style={[
          styles.enhancedButton,
          disabled && { opacity: 0.6 },
        ]}
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
            <Text style={[styles.buttonText, { color: ui.text }]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Input Component
const EnhancedInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  width?: number;
  keyboardType?: 'numeric' | 'default';
  suffix?: string;
}> = ({ value, onChangeText, placeholder, width = 70, keyboardType = 'numeric', suffix }) => {
  const { ui } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ width }]}>
      <TextInput
        style={[
          styles.enhancedInput,
          {
            borderColor: isFocused ? ui.text : ui.border,
            color: ui.text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={ui.textMuted + '80'}
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

// Progress Indicator Component
const ProgressIndicator: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
  const { ui } = useTheme();
  const progress = total > 0 ? completed / total : 0;

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor: ui.textMuted + '20' }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: ui.primary,
            },
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

  const { programId, workoutId } = useLocalSearchParams<{
    programId: string;
    workoutId: string;
  }>();
  const router = useRouter();
  const workoutNum = workoutId ? parseInt(workoutId, 10) : NaN;
  if (isNaN(workoutNum)) return null;

  const [exTemplates, setExTemplates] = useState<ExerciseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [logs, setLogs] = useState<Record<number, ExerciseLogEntry[]>>({});
  const [currentExercise, setCurrentExercise] = useState<number>(0);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const restTimeLeftRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of open swipeables

  useEffect(() => {
    const initialize = async () => {
      // Create a new workout log row
      const {
  data: { user },
  error: userError
} = await supabase.auth.getUser();

if (userError || !user) {
  Alert.alert("Error", "User not authenticated.");
  router.back();
  return;
}

const { data: logData, error: logError } = await supabase
  .from("workout_logs")
  .insert([
    {
      workout_template_id: workoutNum,
      user_id: user.id // 👈 Add this line
    }
  ])
  .select("id")
  .single();


      if (logError || !logData) {
        console.error("Error creating workout log:", logError?.message);
        router.back();
        return;
      }
      setSessionId(logData.id);

      // Fetch exercise templates
      const { data: exData, error: exError } = await supabase
        .from("exercise_templates")
        .select("id, name, default_sets, default_reps, order_index")
        .eq("workout_template_id", workoutNum)
        .order("order_index", { ascending: true });

      if (exError || !exData) {
        console.error(
          "Error fetching exercise templates:",
          exError?.message
        );
        setExTemplates([]);
      } else {
        setExTemplates(exData);

        // Initialize logs state
        const initLogs: Record<number, ExerciseLogEntry[]> = {};
        exData.forEach((ex) => {
          initLogs[ex.id] = Array(ex.default_sets)
            .fill(0)
            .map(() => ({ weight: "", reps: "", isWarmup: false, completed: false }));
        });
        setLogs(initLogs);
      }

      setLoading(false);
    };

    initialize();
  }, [workoutNum, router]);

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

  // Calculate total progress
  const getTotalProgress = () => {
    const allSets = Object.values(logs).flat();
    const completedSets = allSets.filter(set => set.completed).length;
    return { completed: completedSets, total: allSets.length };
  };

  // Update a single field in a log entry
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

  // Toggle set completion
  const toggleSetCompletion = (exId: number, setIdx: number) => {
    setLogs((prev) => {
      const updated = [...(prev[exId] || [])];
      const currentSet = updated[setIdx];
      updated[setIdx] = {
        ...currentSet,
        completed: !currentSet.completed,
      };
      return { ...prev, [exId]: updated };
    });

    // Start rest timer when a set is completed
    const wasCompleted = logs[exId]?.[setIdx]?.completed;
    if (!wasCompleted) {
      startRestTimer(60); // 60 seconds rest
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      // Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
    }
  };

const startRestTimer = (seconds: number) => {
  if (restTimeLeftRef.current) {
    clearInterval(restTimeLeftRef.current);
  }

  setRestTimeLeft(seconds);

  restTimeLeftRef.current = setInterval(() => {
    setRestTimeLeft((prev: number | null) => {
      if (prev === null || prev <= 1) {
        clearInterval(restTimeLeftRef.current!);
        return null;
      }
      return prev - 1;
    });
  }, 1000);
};



  // Toggle warmup flag
const toggleWarmup = (exId: number, setIdx: number) => {
  setLogs((prev) => {
    console.log('Prev logs:', prev);
    const updated = [...(prev[exId] || [])];
    updated[setIdx] = {
      ...updated[setIdx],
      isWarmup: !updated[setIdx].isWarmup,
    };
    console.log('Updated sets:', updated);
    return { ...prev, [exId]: updated };
  });
};

  // Delete a set
  const deleteSet = (exId: number, setIdx: number) => {
    setLogs((prev) => {
      const updated = [...(prev[exId] || [])];
      updated.splice(setIdx, 1);
      return { ...prev, [exId]: updated };
    });
  };

  // Add a new set row
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

  // Submit logs to database
  const handleSubmit = async () => {
  if (!sessionId) return;
  setLoading(true);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    Alert.alert("Error", "User not authenticated.");
    setLoading(false);
    return;
  }

  const toInsert = Object.entries(logs).flatMap(
    ([exIdStr, entries]) => {
      const exId = parseInt(exIdStr, 10);
      return entries.map((entry, idx) => ({
        user_id: user.id, // 👈 Include user ID here
        workout_log_id: sessionId,
        exercise_template_id: exId,
        set_number: idx + 1,
        reps_performed: parseInt(entry.reps, 10) || 0,
        weight_used: parseFloat(entry.weight) || 0,
        is_warmup: entry.isWarmup,
      }));
    }
  );

  const { error: insertError } = await supabase
    .from("exercise_logs")
    .insert(toInsert);

  if (insertError) {
    console.error("Error inserting exercise logs:", insertError.message);
    Alert.alert("Error", "Failed to save workout. Please try again.");
    setLoading(false);
    return;
  }

  router.replace(`/workouts/${programId}/${workoutId}`);
};

  const progress = getTotalProgress();

  return (
      <ScreenWrapper>
        <Header 
          leftIcon={<BackButton />}
          title={""}
          rightIcon={restTimeLeft !== null && (
                  <View style={[styles.restTimer, { backgroundColor: ui.primary }]}>
                    <Ionicons name="time-outline" size={20} color={ui.text} style={{marginRight: 4}}/>
                    <Text style={[styles.exerciseBadgeText, { color: ui.text }]}>{restTimeLeft}s</Text>
                  </View>
                )}
        />
        <ProgressIndicator completed={progress.completed} total={progress.total} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.select({
            ios: "padding",
            android: undefined,
          })}
        >
            {exTemplates.map((ex, exerciseIndex) => (
              <View key={ex.id} style={[styles.exerciseCard]}>
                {/* Exercise Header */}
                  <View style={styles.exerciseInfo}>
                    <View style={styles.exerciseHeader}>
                    <Text style={[styles.exerciseTitle, { color: ui.text }]}>
                      {ex.name}
                    </Text>
                    <View style={[styles.exerciseBadge, { backgroundColor: ui.textMuted + '20' }]}>
                      <Text style={[styles.exerciseBadgeText, { color: ui.textMuted }]}>
                        {logs[ex.id]?.filter(s => s.completed).length || 0}/{logs[ex.id]?.length || 0}
                      </Text>
                    </View>  
                    </View>
                    <Text style={[styles.exerciseSubtitle, { color: ui.textMuted, marginTop: 4 }]}>
                      Exercise {exerciseIndex + 1} of {exTemplates.length}
                    </Text>
                    <View style={[styles.setRestTimer, { backgroundColor: ui.primary, marginTop: 12 }]}>
                      <Ionicons name="time-outline" size={20} color={ui.text} style={{ marginRight: 4 }} />
                      <Text style={[styles.exerciseBadgeText, { color: ui.text }]}>Rest Timer: 3 min</Text>
                    </View>
                    <TextInput placeholder="Notes" style={[styles.inputContainer, { color: ui.text, marginTop: 12 }]} />
                  </View>
                  {/* Sets completed out of total */}        

                {/* Sets List */}
                <View style={styles.setsContainer}>
                  {(logs[ex.id] || []).map((entry, idx) => {
                    // Count non-warmup sets up to this index
                    const nonWarmCount = logs[ex.id]
                      .slice(0, idx + 1)
                      .filter((e) => !e.isWarmup).length;
                    const displayNumber = entry.isWarmup
                      ? "W"
                      : String(nonWarmCount);
                    const key = `${ex.id}-${idx}`;

                    return (
                      <Swipeable
                          key={`${ex.id}-${idx}`}
                        renderRightActions={() => (
                          <View style={{ backgroundColor: 'red', justifyContent: 'center'}}>
                            <Pressable onPress={() => deleteSet(ex.id, idx)}>
                              <Text style={{ color: 'white', paddingHorizontal: 20 }}>Delete</Text>                                          
                            </Pressable>
                          </View>
                        )}
                        renderLeftActions={() => (
                          <View style={{ backgroundColor: 'yellow', justifyContent: 'center'}}>
                            <Pressable onPress={() => toggleWarmup(ex.id, idx)}>
                              <Text style={{ color: 'white', paddingHorizontal: 20 }}>Warmup</Text>
                            </Pressable>
                          </View>
                        )}
                        onSwipeableOpen={(direction) => {
                          if (direction === 'left') {
                          } 
                          else {
                          }
                        }}
                      >
                          <View
                            style={[
                              styles.setRow,
                              {
                                backgroundColor: 
                                  entry.completed
                                  ? ui.primary
                                  : ui.bgDark,
                                flexDirection: "row",
                                alignItems: "flex-start", // so labels stack above inputs
                              },
                            ]}
                          >

                            {/* Set Number */}
                            <View style={{ alignItems: "center", width: 40 }}>
                              <Text style={[styles.label, { color: ui.textMuted }]}>Set</Text>
                              <Text style={[styles.setNumber, { color: ui.text }]}>
                                {displayNumber}
                              </Text>
                            </View>

                            {/* Previous */}
                            <View style={{ alignItems: "center", width: 50 }}>
                              <Text style={[styles.label, { color: ui.textMuted }]}>Previous</Text>
                              <Text style={[styles.previousText, { color: ui.textMuted }]}>-</Text>
                            </View>

                            {/* Weight Input */}
                            <View style={{ alignItems: "center", width: 70 }}>
                              <Text style={[styles.label, { color: ui.textMuted }]}>Weight</Text>
                              <EnhancedInput
                                value={entry.weight}
                                onChangeText={(t) => updateLogEntry(ex.id, idx, "weight", t)}
                                placeholder=""
                                width={70}
                                suffix="kg"
                                keyboardType="numeric"
                              />
                            </View>

                            {/* Reps Input */}
                            <View style={{ alignItems: "center", width: 70 }}>
                              <Text style={[styles.label, { color: ui.textMuted }]}>Reps</Text>
                              <EnhancedInput
                                value={entry.reps}
                                onChangeText={(t) => updateLogEntry(ex.id, idx, "reps", t)}
                                placeholder=""
                                width={70}
                              />
                            </View>

                            {/* Finish Checkbox */}
                            <View style={{ alignItems: "center", width: 50 }}>
                              <Text style={[styles.label, { color: ui.textMuted }]}>Done</Text>
                              <TouchableOpacity
                                style={[
                                  styles.setCheckbox,
                                  {
                                    backgroundColor: entry.completed ? ui.primary : 'transparent',
                                    borderColor: entry.completed ? ui.primary : ui.textMuted + '40',
                                  },
                                ]}
                                onPress={() => toggleSetCompletion(ex.id, idx)}
                              >
                                {entry.completed && (
                                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                )}
                              </TouchableOpacity>
                            </View>

                          </View>
                        </Swipeable>

                    );
                  })}
                </View>

                {/* Add Set Button */}
                <EnhancedButton
                  title="Add Set"
                  onPress={() => addSet(ex.id)}
                  variant="secondary"
                  style={{borderWidth: 1, borderColor: ui.border, borderRadius: 25}}
                />
              </View>
            ))}

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
        </KeyboardAvoidingView>
      </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: screenWidth - 32,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  exerciseCard: {
    marginBottom: 24,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  setRestTimer: {
  flexDirection: 'row', 
  alignItems: 'center', 
  alignSelf: 'flex-start',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
  },
  restTimer: {
  flexDirection: 'row', 
  alignItems: 'center', 
  alignSelf: 'flex-start',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
  },
  restTimerText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  setsContainer: {
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderWidth: 1,
  },
  setCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  previousContainer: {
    width: 50,
    alignItems: 'center',
  },
  previousText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    fontSize: 16,
  },
  enhancedInput: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputSuffix: {
    position: 'absolute',
    right: 4,
    top: 10,
    fontSize: 12,
    fontWeight: '500',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  warmupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  enhancedButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addSetButton: {
    borderWidth: 1,
    borderRadius: 25,
  },
  finishContainer: {
    marginTop: 24,
  },
  finishButton: {
    paddingVertical: 16,
  },
  label: {
  fontSize: 14,
  fontWeight: "600",
  marginBottom: 4,
},
});