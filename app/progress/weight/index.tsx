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
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";

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

  const data = [{value:82.5},{value:82.3},{value:82.6},{value:82.2},{value:82},{value:81.9},{value:81.7},{value:81.8},{value:81.5},{value:81.4},{value:81.2},{value:81.3},{value:81.1},{value:80.9},{value:81},{value:80.8},{value:80.7},{value:80.6},{value:80.5},{value:80.3},{value:80.2},{value:80.4},{value:80.1},{value:80},{value:79.8},{value:79.7},{value:79.9},{value:79.6},{value:79.5},{value:79.3}];


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
        <ActivityIndicator size="large" color={ui.bg} />
      </View>
    );
  }
  const minWeight = 79;
const maxWeight = 85;

const normalize = (val: number) => (val - minWeight) / (maxWeight - minWeight);

const normalizedData = data.map(d => ({ value: normalize(d.value) }));

const yAxisLabels = [79, 80, 81, 82, 83, 84, 85].map(val => ({
  value: normalize(val),
  label: val.toString(),
}));


  const screenWidth = Dimensions.get("window").width - 32; // 16px padding each side

  return (
    <ScreenWrapper scroll={false}>
      <Header 
        leftIcon={<BackButton />}
        title="Weight Progress"
        rightIcon={
          <Pressable
            onPress={() => router.push("/progress/weight/new")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        }
      />
      {/* If no logs, show empty state */}
      {weightLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ui.textMuted }]}>
            You haven’t logged any weight yet.
          </Text>
        </View>
      ) : (
        <>
          {/* Bar chart */}
      <BarChart
        xAxisColor={ui.text}
        yAxisColor={ui.text}
        xAxisLabelTextStyle={{ color: '#ffffff' }}
        yAxisTextStyle={{ color: '#ffffff' }}
        data={data}
        showGradient
        gradientColor={'#0b63f6'}
        frontColor={'#003bc521'}
      />
        <LineChart
        color={ui.primary}
        thickness={3}
          data={normalizedData}
          yAxisTextStyle={{ color: ui.textMuted }}
          xAxisColor={'transparent'}
          yAxisColor={'transparent'}
          xAxisLabelTextStyle={{ color: ui.textMuted }}
          areaChart1
          startFillColor={ui.primary}
          startOpacity={0.4}
          endFillColor={ui.primary}
          endOpacity={0.0}
          curved
          rulesColor={ui.bgLight}
          isAnimated
          animationDuration={2500}
          initialSpacing={0}
          endSpacing={0}
          yAxisLabelTexts={yAxisLabels.map(l => l.label)} // show the real values
          hideDataPoints1
          rulesType="solid"
          pointerConfig={{
            pointerColor: ui.primary,
            radius: 6,
          }}
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