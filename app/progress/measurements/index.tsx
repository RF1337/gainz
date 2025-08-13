import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import MeasurementPickerContent from "@/components/MeasurementPicker";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

type Measurements = {
  neck: string;
  shoulders: string;
  chest: string;
  biceps: string;
  forearm: string;
  waist: string;
  hips: string;
  thighs: string;
  calves: string;
};

export default function MeasurementsScreen() {
  const { ui } = useTheme();
  const router = useRouter();

  const [measurements, setMeasurements] = useState<Measurements>({
    neck: "",
    shoulders: "",
    chest: "",
    biceps: "",
    forearm: "",
    waist: "",
    hips: "",
    thighs: "",
    calves: "",
  });

  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<keyof Measurements | null>(null);

  const handleChange = (key: keyof Measurements, value: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Not signed in", "Please sign in to save measurements.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("measurements").upsert(
        [
          {
            user_id: user.id,
            date: new Date().toISOString().split("T")[0],
            neck_cm: parseFloat(measurements.neck) || 0,
            shoulders_cm: parseFloat(measurements.shoulders) || 0,
            chest_cm: parseFloat(measurements.chest) || 0,
            biceps_cm: parseFloat(measurements.biceps) || 0,
            forearm_cm: parseFloat(measurements.forearm) || 0,
            waist_cm: parseFloat(measurements.waist) || 0,
            hips_cm: parseFloat(measurements.hips) || 0,
            thighs_cm: parseFloat(measurements.thighs) || 0,
            calves_cm: parseFloat(measurements.calves) || 0,
          },
        ],
        {
          onConflict: "user_id,date",
        }
      );

      if (error) throw error;

      Alert.alert("Success", "Measurements saved.");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not save measurements.");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening picker for specific key
  const openPickerForKey = (key: keyof Measurements) => {
    setSelectedKey(key);
    setPickerVisible(true);
  };

  // Handle confirming measurement value
  const handleConfirmMeasurement = (value: number) => {
    if (selectedKey) {
      handleChange(selectedKey, value.toString());
    }
    setPickerVisible(false);
    setSelectedKey(null);
  };

  // Handle dismissing picker
  const handleDismissPicker = () => {
    setPickerVisible(false);
    setSelectedKey(null);
  };

  // Get current value for picker
  const getCurrentValue = () => {
    if (!selectedKey) return 0;
    const currentValue = measurements[selectedKey];
    return currentValue ? parseFloat(currentValue) : 0;
  };

  // Get label for selected key
  const getSelectedLabel = () => {
    if (!selectedKey) return "";
    const labels = {
      neck: "neck",
      shoulders: "shoulders", 
      chest: "chest",
      biceps: "biceps",
      forearm: "forearm",
      waist: "waist",
      hips: "hips",
      thighs: "thighs",
      calves: "calves"
    };
    return labels[selectedKey];
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: ui.bgDark }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenWrapper>
        <Header leftIcon={<BackButton />} title="Body Measurements" />

        {loading && (
          <ActivityIndicator size="large" color={ui.primary} style={{ margin: 16 }} />
        )}

        {(
          [
            { key: "neck", label: "Neck (cm)" },
            { key: "shoulders", label: "Shoulders (cm)" },
            { key: "chest", label: "Chest (cm)" },
            { key: "biceps", label: "Biceps (cm)" },
            { key: "forearm", label: "Forearm (cm)" },
            { key: "waist", label: "Waist (cm)" },
            { key: "hips", label: "Hips (cm)" },
            { key: "thighs", label: "Thighs (cm)" },
            { key: "calves", label: "Calves (cm)" },
          ] as const
        ).map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => openPickerForKey(key)}
            style={[styles.fieldContainer, { backgroundColor: ui.bg }]}
          >
            <Text style={[styles.label, { color: ui.text }]}>{label}</Text>
            <Text style={[styles.value, { color: measurements[key] ? ui.text : ui.textMuted }]}>
              {measurements[key] ? `${measurements[key]} cm` : "Tap to set"}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={[styles.saveButton, { backgroundColor: ui.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Saving..." : "Save Measurements"}
          </Text>
        </Pressable>
      </ScreenWrapper>

      {/* Measurement Picker */}
      {pickerVisible && selectedKey && (
        <MeasurementPickerContent
          title={`Select ${getSelectedLabel()} measurement`}
          initialValue={getCurrentValue()}
          onValueChange={(value) => {
            // Optional: Real-time preview while scrolling
            console.log(`${selectedKey} changing to:`, value);
          }}
          onConfirm={handleConfirmMeasurement}
          onDismiss={handleDismissPicker}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fieldContainer: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});