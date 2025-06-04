import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const quickActions = [
  { icon: "fast-food-outline", label: "Add Food", color: "#82ec6c" },
  { icon: "barbell-outline", label: "Add Workout", color: "#ff6b6b" },
  { icon: "water-outline", label: "Add Water", color: "#67b7ff" },
  { icon: "bed-outline", label: "Add Sleep", color: "#a29bfe" },
  { icon: "scale-outline", label: "Add Weight", color: "#00cec9" },
];

export default function QuickAddScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <ScrollView style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>Quick Add</Text>

        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} style={[styles.row, { backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2" }]}>
            <View style={styles.left}>
              <Ionicons name={action.icon as any} size={24} color={action.color} style={{ marginRight: 12 }} />
              <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>{action.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#888" : "#999"} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});