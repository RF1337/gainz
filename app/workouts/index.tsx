// app/(tabs)/workouts/index.tsx
import { useThemeContext } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
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

type Program = {
  id: number;
  name: string;
  created_at: string;
};

export default function ProgramListScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";
  const colors = {
    background: isDark ? "#000" : "#fff",
    card: isDark ? "#1e1e1e" : "#f2f2f2",
    text: isDark ? "#fff" : "#000",
    subText: isDark ? "#aaa" : "#888",
    accent: "#ff6b00",
  };

  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

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
        .from("program")
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

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Program }) => (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/workouts/${item.id}`)}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.cardDate, { color: colors.subText }]}>
        Created on {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </Pressable>
  );

  const ListFooter = () => (
    <Pressable
      style={[styles.addButton, { backgroundColor: colors.accent }]}
      onPress={() => router.push("/workouts/new-program")}
    >
      <Text style={[styles.addButtonText, { color: "#fff" }]}>
        + Create Program
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>My Programs</Text>

      {programs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            You haven’t created any programs yet.
          </Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/workouts/new-program")}
          >
            <Text style={[styles.addButtonText, { color: "#fff" }]}>
              + Create Program
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={programs}
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
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
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
  cardDate: {
    fontSize: 12,
    marginTop: 4,
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
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
});