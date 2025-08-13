import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase"; // adjust path if needed
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function FoodIndex() {
  const { ui } = useTheme();

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentFoods, setRecentFoods] = useState<any[]>([]);


const [todayNutrition, setTodayNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

 useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      const user_id = userData?.user?.id;

      if (authError || !user_id) {
        console.error('Auth error or user not found:', authError?.message);
        return;
      }

      // Fetch recent food entries (limit 5)
      const { data: recentData, error: recentError } = await supabase
        .from("food_entries")
        .select("product_name, calories, created_at")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) {
        console.error("Error fetching food entries:", recentError.message);
      } else {
        setRecentFoods(recentData);
      }

      // Calculate today's nutrition totals
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayData, error: todayError } = await supabase
        .from("food_entries")
        .select("calories, protein, carbs, fat, created_at")
        .eq("user_id", user_id)
        .gte("created_at", today.toISOString());

      if (todayError) {
        console.error("Failed to fetch today's food entries:", todayError.message);
        return;
      }

      const totals = todayData.reduce(
        (acc, entry) => {
          acc.calories += entry.calories ?? 0;
          acc.protein += entry.protein ?? 0;
          acc.carbs += entry.carbs ?? 0;
          acc.fat += entry.fat ?? 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setTodayNutrition(totals);
    };

    fetchData();
  }, []);

  return (
    <ScreenWrapper
      scroll={false}
      >
      <Header
        leftIcon={<BackButton/>}
        title="Nutrition"
        rightIcon={<Ionicons name="ellipsis-horizontal" size={24} color={ui.text} />}
      />
      {/* ─── Search Bar with Scanner Icon ───────────────────────────── */}
      <View style={[styles.searchContainer, { backgroundColor: ui.bgDark, borderColor: ui.bg }]}>
        <Ionicons name="search-outline" size={20} color={ui.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: ui.text }]}
          placeholder="Food, meal or brand"
          placeholderTextColor={ui.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable onPress={() => router.push("/scanner/camera")} style={styles.iconButton}>
          <Ionicons name="barcode-outline" size={24} color={ui.primary} />
        </Pressable>
      </View>

      {/* ─── Daily Intake Card ───────────────────────────── */}
      <View style={[styles.card, { backgroundColor: ui.bg }]}>
        <Text style={[styles.cardTitle, { color: ui.text }]}>Daily intake</Text>
        <Text style={[styles.cardSubtitle, { color: ui.textMuted }]}>{Math.ceil(todayNutrition.calories)} kcal</Text>
        <View style={styles.macrosRow}>
          <View style={styles.macroColumn}>
            <Text style={[styles.macroLabel, { color: ui.text }]}>Carbs</Text>
            <Text style={[styles.macroValue, { color: ui.textMuted }]}>{Math.ceil(todayNutrition.carbs)} g carbs</Text>
          </View>
          <View style={styles.macroColumn}>
            <Text style={[styles.macroLabel, { color: ui.text }]}>Protein</Text>
            <Text style={[styles.macroValue, { color: ui.textMuted }]}>{Math.ceil(todayNutrition.protein)} g protein</Text>
          </View>
          <View style={styles.macroColumn}>
            <Text style={[styles.macroLabel, { color: ui.text }]}>Fat</Text>
            <Text style={[styles.macroValue, { color: ui.textMuted }]}>{Math.ceil(todayNutrition.fat)} g fat</Text>
          </View>
        </View>
      </View>

      {/* ─── Recently Tracked Food ───────────────────────────── */}
      {recentFoods.length > 0 && (
        <View>
          <Text style={[styles.cardTitle, { color: ui.text, marginBottom: 8 }]}>
            Recently Tracked
          </Text>
          <FlatList
            data={recentFoods}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.recentItem, { backgroundColor: ui.bg }]}>
                <Text style={[styles.recentText, { color: ui.text }]}>
                  {item.product_name}
                </Text>
                <Text style={[styles.recentText, { color: ui.textMuted }]}>
                  {item.calories ?? "?"} kcal
                </Text>
              </View>
            )}
          />
        </View>
      )}

      {/* ─── Info Text ───────────────────────────── */}
      <View>
        <Text style={[styles.infoText, { color: ui.textMuted }]}>
          Here you’ll find your recently tracked food and meals for quick access
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 36,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroColumn: {
    alignItems: "center",
    flex: 1,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  macroValue: {
    fontSize: 12,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    marginTop: 16,
  },
  recentItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recentText: {
    fontSize: 14,
  },
});