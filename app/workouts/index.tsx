// app/(tabs)/programs.tsx

import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

type Program = {
  id: number;
  name: string;
  created_at: string;
};

export default function ProgramListScreen() {
  const { ui } = useTheme();

  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/(auth)");
        return;
      }

      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching programs:", error.message);
        setPrograms([]);
      } else {
        setPrograms((data as Program[]) || []);
      }
      setLoading(false);
    };

    fetchPrograms();
  }, []);

  const deleteProgram = async (programId: number) => {
    try {
      const { error } = await supabase.from("programs").delete().eq("id", programId);
      if (error) throw error;
      setPrograms((prev) => prev.filter((p) => p.id !== programId));
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not delete program.");
    }
  };

  const importProgramByCode = async () => {
    Alert.prompt("Import Program", "Enter the program copy code:", async (inputCode) => {
      if (!inputCode) return;

      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        Alert.alert("Error", "User not authenticated.");
        return;
      }

      const { data: sourcePrograms, error } = await supabase
        .from("programs")
        .select("*")
        .eq("copy_code", inputCode)
        .limit(1);

      if (error || !sourcePrograms || sourcePrograms.length === 0) {
        setLoading(false);
        Alert.alert("Not Found", "No program found with that code.");
        return;
      }

      const source = sourcePrograms[0];

      const { data: newProgram, error: insertError } = await supabase
        .from("programs")
        .insert({
          name: source.name,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError || !newProgram) {
        setLoading(false);
        Alert.alert("Error", "Failed to import program.");
        return;
      }

      const { data: sourceTemplates, error: templatesError } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("program_id", source.id);

      let workoutMap: Record<number, number> = {};
      let clonedWorkoutTemplates: any[] = [];

      if (sourceTemplates && sourceTemplates.length > 0) {
        const inserts = sourceTemplates.map((template) => ({
          name: template.name,
          program_id: newProgram.id,
          order_index: template.order_index,
          created_at: new Date().toISOString(),
        }));

        const { data: newTemplates, error: insertTemplatesError } = await supabase
          .from("workout_templates")
          .insert(inserts)
          .select();

        if (!insertTemplatesError && newTemplates) {
          clonedWorkoutTemplates = newTemplates;
          for (let i = 0; i < sourceTemplates.length; i++) {
            workoutMap[sourceTemplates[i].id] = newTemplates[i].id;
          }
        }
      }

      const { data: sourceExercises } = await supabase
        .from("exercise_templates")
        .select("*")
        .in(
          "workout_template_id",
          (sourceTemplates ?? []).map((t) => t.id)
        );

      if (sourceExercises && sourceExercises.length > 0) {
      const clonedExercises = (sourceExercises ?? [])
        .map((ex) => {
          const newWorkoutId = workoutMap[ex.workout_template_id];
          if (!newWorkoutId) {
            console.warn("Missing workout_template mapping for", ex.name);
            return null;
          }

          return {
            // 🚫 DO NOT include id
            name: ex.name,
            default_sets: ex.default_sets,
            default_reps: ex.default_reps,
            order_index: ex.order_index,
            workout_template_id: newWorkoutId,
            created_at: new Date().toISOString(),
          };
        })
        .filter(Boolean); // removes any nulls

        const { error: insertExercisesError } = await supabase
          .from("exercise_templates")
          .insert(clonedExercises);

        if (insertExercisesError) {
          console.error("Error inserting cloned exercises:", insertExercisesError.message);
        }
      }

      setPrograms((prev) => [newProgram as Program, ...prev]);
      setLoading(false);
      router.push(`/workouts/${newProgram.id}`);
    }, "plain-text");
  };

  const renderRightActions = (_progress: any, item: Program) => (
    <Pressable
      style={[styles.deleteButton, { backgroundColor: "#dc3545" }]}
      onPress={() => {
        const ref = swipeableRefs.current.get(item.id);
        ref?.close();
        Alert.alert("Delete Program", `Delete "${item.name}"?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteProgram(item.id),
          },
        ]);
      }}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </Pressable>
  );

  const renderItem = ({ item }: { item: Program }) => (
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
        style={[styles.card, ]}
        onPress={() => router.push(`/workouts/${item.id}`)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 60, height: 60, borderRadius: 4, backgroundColor: "#6C5CE7", justifyContent: "center", alignItems: "center" }}>
          <Ionicons name={"barbell-outline"} size={20} color="#fff"/>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.cardTitle, { color: ui.text }]}>{item.name}</Text>
            <Text style={[styles.cardDate, { color: ui.textMuted }]}>
            Created on {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );

  const ListHeader = () => (
    <View>
      <Pressable
        style={[styles.card, ]}
        onPress={() => router.push(`/workouts/new-program`)}
        >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 60, height: 60, borderRadius: 4, backgroundColor: ui.primary, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name={"add"} size={28} color="#fff"/>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.cardTitle, { color: ui.text }]}>Create Program</Text>
          </View>
        </View>
      </Pressable>
      <Pressable
        style={[styles.card, ]}
        onPress={importProgramByCode}
        >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 60, height: 60, borderRadius: 4, backgroundColor: "#2d3436", justifyContent: "center", alignItems: "center" }}>
          <Ionicons name={"arrow-down-circle-outline"} size={28} color="#fff"/>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.cardTitle, { color: ui.text }]}>Import by code</Text>
          </View>
        </View>
      </Pressable>
    </View>
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
        <Header
          leftIcon={<BackButton />}
          title="My Programs"
        />
        {programs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: ui.textMuted }]}>
              You haven’t created any programs yet.
            </Text>
            <View>
              <Pressable
                style={[styles.card, ]}
                onPress={() => router.push(`/workouts/new-program`)}
                >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 60, height: 60, borderRadius: 4, backgroundColor: ui.primary, justifyContent: "center", alignItems: "center" }}>
                  <Ionicons name={"add"} size={28} color="#fff"/>
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: ui.text }]}>Create Program</Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                style={[styles.card, ]}
                onPress={importProgramByCode}
                >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 60, height: 60, borderRadius: 4, backgroundColor: "#2d3436", justifyContent: "center", alignItems: "center" }}>
                  <Ionicons name={"arrow-down-circle-outline"} size={28} color="#fff"/>
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: ui.text }]}>Import by code</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        ) : (
          <FlatList
            data={programs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={ListHeader}
          />
        )}
      </ScreenWrapper>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 4,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "600" },
  cardDate: { fontSize: 12, marginTop: 4 },
  addButton: {
    marginBottom: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { fontSize: 16, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 16, marginBottom: 16, textAlign: "center" },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginVertical: 8,
    borderRadius: 12,
  },
});
