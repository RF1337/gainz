import AvatarIcon from "@/components/AvatarIcon";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function ProfileScreen() {
  const {ui} = useTheme();
  const { t } = useTranslation();

  const [workouts, setWorkouts] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [username, setUsername] = useState("user");

  useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      // Fetch user profile data (adjust table/column names to your schema)
      const { data: profile, error: profileError } = await supabase
        .from("profiles") // or "profiles" if your table is plural
        .select("username")
        .eq("id", user.id)
        .single();

      if (!profileError && profile?.username) {
        setUsername(profile.username);
      }

      // Fetch workout count
      const { count, error: workoutError } = await supabase
        .from("workout_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id); // adjust if your schema differs

      if (!workoutError && typeof count === "number") {
        setWorkouts(count);
      }
    } catch (error) {
      console.error("Failed to fetch profile info:", error);
    }
  };

  fetchUserProfile();
}, []);

const renderRow = (
    icon: string,
    label: string,
    subLabel: string,
    onPress: () => void,
    options?: { iconColor?: string; showChevron?: boolean }
  ) => (
    <TouchableOpacity style={[styles.row, { backgroundColor: ui.bg }]} onPress={onPress}>
      <View style={styles.rowLabel}>
        <Ionicons
          name={icon as any}
          size={20}
          color={options?.iconColor ?? ui.textMuted}
          style={styles.icon}
        />
        <View>
          <Text style={[styles.label, { color: ui.text }]}>{label}</Text>
          {subLabel.length > 0 && (
            <Text style={[styles.subLabel, { color: ui.textMuted }]}>
              {subLabel}
            </Text>
          )}
        </View>
      </View>
      {options?.showChevron !== false && (
        <Ionicons name="chevron-forward-outline" size={20} color={ui.text} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      {/* Settings icon */}
      <Header
        leftIcon={
          <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="person-add-outline" size={24} color={ui.text} />
        </TouchableOpacity>
        }
        title={t('navigation.profile')}
        rightIcon={
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={24} color={ui.text} />
        </TouchableOpacity>
        }
      />

      {/* Avatar */}
      <View style={styles.userRow}>
        <TouchableOpacity onPress={() => router.push("/settings/profile")}>
          <AvatarIcon size={135} />
        </TouchableOpacity>
        <Text style={[styles.displayName, { color: ui.text }]}>{username}</Text>
        <Text style={[styles.username, { color: ui.textMuted }]}>@{username}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: ui.text }]}>{workouts}</Text>
          <Text style={[styles.statLabel, { color: ui.textMuted }]}>Workouts</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: ui.text }]}>{followers}</Text>
          <Text style={[styles.statLabel, { color: ui.textMuted }]}>Followers</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: ui.text }]}>{following}</Text>
          <Text style={[styles.statLabel, { color: ui.textMuted }]}>Following</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color={ui.text} />
        </TouchableOpacity>
      </View>

      {/* Widgets */}
      <View>
        {renderRow("people-outline", "Friends", "Manage your friends", () => router.push("../settings/friends"))}
        {renderRow("calendar-outline", "Workout History", "View your workout history", () => router.push("../settings/workout-history"))}
        {renderRow("trophy-outline", "Goals", "Set and manage your goals", () => router.push("../settings/goals"))}
        {renderRow("nutrition-outline", "Food Summary", "View daily and weekly intake", () => router.push("../settings/food-summary"))}
        {renderRow("flame-outline", "Streaks", "Track workout consistency", () => router.push("../settings/streaks"))}
        {renderRow("medal-outline", "Badges", "See your earned achievements", () => router.push("../settings/badges"))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  userInfo: {
    flexDirection: "column",
  },
  userRow: {
    alignItems: "center",
    justifyContent: "center",
    },
  username: {
    fontSize: 16,
  },
  displayName: {
    marginTop: 8,
    fontSize: 24,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  stat: {
    alignItems: "center",
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#444",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  editText: {
    fontSize: 14,
    fontWeight: "500",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  marginTop: 24,
  gap: 16,
},
badgeBox: {
  width: 120,
  height: 100,
  borderRadius: 16,
  backgroundColor: "#2c2c2e", // or ui.bg if you want theme-aware
  alignItems: "center",
  justifyContent: "center",
  padding: 12,
},
badgeLabel: {
  marginTop: 8,
  fontSize: 14,
  fontWeight: "500",
  textAlign: "center",
},
  row: {
    flex: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    marginVertical: 8,
  },
  rowLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  subLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});