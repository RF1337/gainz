import { Picker } from "@expo/ui/swift-ui";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_HEIGHT = SCREEN_HEIGHT * 0.4;
const DISMISS_THRESHOLD = SCREEN_HEIGHT * 0.3;

interface MeasurementPickerProps {
  title?: string;
  initialValue?: number;
  onConfirm?: (value: number) => void;
  onDismiss?: () => void;
}

export default function MeasurementPickerSwiftUI({
  title = "Select Measurement",
  initialValue = 170.0,
  onConfirm,
  onDismiss,
}: MeasurementPickerProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });

  const cmList = Array.from({ length: 301 }, (_, i) => `${i}`);
  const mmList = Array.from({ length: 10 }, (_, i) => `${i}`);

  const [cmIndex, setCmIndex] = useState(Math.floor(initialValue));
  const [mmIndex, setMmIndex] = useState(Math.round((initialValue % 1) * 10));

  const selectedValue = parseFloat((cmIndex + mmIndex / 10).toFixed(1));

  const scrollTo = (dest: number) => {
    "worklet";
    translateY.value = withSpring(dest, { damping: 40 });
  };

  useEffect(() => {
    scrollTo(SCREEN_HEIGHT - MAX_HEIGHT);
  }, []);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((e) => {
      translateY.value = Math.max(
        context.value.y + e.translationY,
        SCREEN_HEIGHT - MAX_HEIGHT
      );
    })
    .onEnd(() => {
      if (translateY.value > SCREEN_HEIGHT - DISMISS_THRESHOLD) {
        scrollTo(SCREEN_HEIGHT);
        setTimeout(() => onDismiss?.(), 300);
      } else {
        scrollTo(SCREEN_HEIGHT - MAX_HEIGHT);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.sheet, animatedStyle]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>

        <View style={styles.pickerRow}>
          {/* CM Picker */}
          <Picker
            options={cmList}
            selectedIndex={cmIndex}
            onOptionSelected={({ nativeEvent: { index } }) => setCmIndex(index)}
            variant="wheel"
            style={{ height: 400, flex: 1 }}
          />

          {/* MM Picker */}
          <Picker
            options={mmList}
            selectedIndex={mmIndex}
            onOptionSelected={({ nativeEvent: { index } }) => setMmIndex(index)}
            variant="wheel"
            style={{ height: 400, flex: 1 }}
          />
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              scrollTo(SCREEN_HEIGHT);
              setTimeout(() => onDismiss?.(), 300);
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.confirmButton]}
            onPress={() => {
              onConfirm?.(selectedValue);
              scrollTo(SCREEN_HEIGHT);
              setTimeout(() => onDismiss?.(), 300);
            }}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    zIndex: 1000,
  },
  handle: {
    width: 75,
    height: 4,
    backgroundColor: "#888",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#1e90ff",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
});
