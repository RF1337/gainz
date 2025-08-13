// app/settings/goals.tsx
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { getGoal, setGoal } from "@/services/goalsService";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function GoalsSettingScreen() {
  const { ui } = useTheme();

  // Local state for each goal
  const [stepGoal, setStepGoal] = useState<string>("");
  const [exerciseGoal, setExerciseGoal] = useState<string>("");
  const [sleepGoal, setSleepGoal] = useState<string>("");
  const [waterGoal, setWaterGoal] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);

  // On mount, fetch any saved goals from your service
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const savedStep = await getGoal("stepGoal");
        const savedExercise = await getGoal("exerciseGoal");
        const savedSleep = await getGoal("sleepGoal");
        const savedWater = await getGoal("waterGoal");

        if (savedStep !== null) setStepGoal(savedStep);
        if (savedExercise !== null) setExerciseGoal(savedExercise);
        if (savedSleep !== null) setSleepGoal(savedSleep);
        if (savedWater !== null) setWaterGoal(savedWater);
      } catch (err: any) {
        console.log("Error loading goals:", err.message || err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handlers that update both state and persist via setGoal
  const handleStepChange = async (text: string) => {
    setStepGoal(text);
    await setGoal("stepGoal", text);
  };
  const handleExerciseChange = async (text: string) => {
    setExerciseGoal(text);
    await setGoal("exerciseGoal", text);
  };
  const handleSleepChange = async (text: string) => {
    setSleepGoal(text);
    await setGoal("sleepGoal", text);
  };
  const handleWaterChange = async (text: string) => {
    setWaterGoal(text);
    await setGoal("waterGoal", text);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        leftIcon={<BackButton />}
        title="Goals"
      />
      {/* Step Goal */}
      <View style={styles.row}>
        <View style={styles.iconLabel}>
          <Ionicons
            name="footsteps-outline"
            size={20}
            color={ui.text}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.label, { color: ui.text }]}>
            Daily Step Goal
          </Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: ui.bgDark,
              color: ui.text,
              borderColor: ui.border,
            },
          ]}
          keyboardType="numeric"
          value={stepGoal}
          onChangeText={handleStepChange}
          returnKeyType="done"
          placeholder="e.g. 10000"
          placeholderTextColor={ui.textMuted}
        />
      </View>

      {/* Exercise (Calories) Goal */}
      <View style={styles.row}>
        <View style={styles.iconLabel}>
          <Ionicons
            name="flame-outline"
            size={20}
            color={ui.text}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.label, { color: ui.text }]}>
            Daily Exercise Goal (kcal)
          </Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: ui.bgDark,
              color: ui.text,
              borderColor: ui.border,
            },
          ]}
          keyboardType="numeric"
          value={exerciseGoal}
          onChangeText={handleExerciseChange}
          returnKeyType="done"
          placeholder="e.g. 300"
          placeholderTextColor={ui.textMuted}
        />
      </View>

      {/* Sleep Goal */}
      <View style={styles.row}>
        <View style={styles.iconLabel}>
          <Ionicons
            name="bed-outline"
            size={20}
            color={ui.text}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.label, { color: ui.text }]}>
            Daily Sleep Goal (hours)
          </Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: ui.bgDark,
              color: ui.text,
              borderColor: ui.border,
            },
          ]}
          keyboardType="numeric"
          value={sleepGoal}
          onChangeText={handleSleepChange}
          returnKeyType="done"
          placeholder="e.g. 8"
          placeholderTextColor={ui.textMuted}
        />
      </View>

      {/* Water Intake Goal */}
      <View style={styles.row}>
        <View style={styles.iconLabel}>
          <Ionicons
            name="water-outline"
            size={20}
            color={ui.text}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.label, { color: ui.text }]}>
            Daily Water Goal (L)
          </Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: ui.bgDark,
              color: ui.text,
              borderColor: ui.border,
            },
          ]}
          keyboardType="numeric"
          value={waterGoal}
          onChangeText={handleWaterChange}
          returnKeyType="done"
          placeholder="e.g. 3"
          placeholderTextColor={ui.textMuted}
        />
      </View>
  </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    textAlign: "center",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
