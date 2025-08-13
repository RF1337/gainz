// app/(tabs)/progress/weight/index.tsx

import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  LineChart,
} from "react-native-chart-kit";

type WeightLogRow = {
  id: number;
  weight: number;
  created_at: string;
};

export default function WeightProgressScreen() {
  const { ui } = useTheme();

  const router = useRouter();
  const [weightLogs, setWeightLogs] = useState<WeightLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeightLogs();
  }, []);

  const fetchWeightLogs = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Not signed in", "Please sign in to see your weight logs.");
        setLoading(false);
        return;
      }

      // Fetch all rows for this user, ordered by date ascending
      const { data, error } = await supabase
        .from("weight_logs")
        .select("id, weight, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setWeightLogs((data as WeightLogRow[]) || []);
    } catch (err: any) {
      console.error("Error fetching weight logs:", err.message);
      Alert.alert("Error", "Could not load your weight logs.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the line chart
  const prepareChartData = () => {
    const labels: string[] = [];
    const dataPoints: number[] = [];
    const logs = weightLogs;

    logs.forEach((row) => {
      // Label as “MM/DD” or similar
      const dt = new Date(row.created_at);
      labels.push(
        `${dt.getMonth() + 1}/${dt.getDate()}`
      );
      dataPoints.push(row.weight);
    });

    return { labels, dataPoints };
  };

  // Render a small list below the chart (date + weight)
  const renderItem = ({ item }: { item: WeightLogRow }) => {
    const dt = new Date(item.created_at);
    const dateString = dt.toLocaleDateString();
    return (
      <View style={[styles.logRow, { backgroundColor: ui.bg }]}>
        <Text style={[styles.logDate, { color: ui.text }]}>
          {dateString}
        </Text>
        <Text style={[styles.logWeight, { color: ui.text }]}>
          {item.weight.toFixed(1)} lbs
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: ui.bgDark }]}>
        <ActivityIndicator size="large" color={ui.primary} />
      </View>
    );
  }

  const { labels, dataPoints } = prepareChartData();
  const screenWidth = Dimensions.get("window").width - 32; // 16px padding each side

  return (
    <ScreenWrapper scroll={false}>
      <Header 
        leftIcon={<BackButton />}
        title="Strength Progress"
        rightIcon={
          <Pressable
            onPress={() => router.push("/progress/weight/new")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        }
      />
      {/* “Add New Weight” button */}

      {/* If no logs, show empty state */}
      {weightLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ui.textMuted }]}>
            You haven’t logged any weight yet.
          </Text>
        </View>
      ) : (
        <>
          {/* Line chart */}
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: ui.text }]}>
              Weight Progress
            </Text>
            <LineChart
              data={{
                labels,
                datasets: [
                  {
                    data: dataPoints,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth}
              height={220}
              chartConfig={{
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(255, 107, 0, ${opacity})`, // accent color
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // consistent text color
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#ff6b00",
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 12,
              }}
            />
          </View>

          {/* FlatList of all logs below */}
          <FlatList
            data={weightLogs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  newButton: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  newButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  chartContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  logDate: { fontSize: 16, fontWeight: "500" },
  logWeight: { fontSize: 16, fontWeight: "500" },
  separator: { height: 1, marginVertical: 8 },
});