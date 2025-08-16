import AvatarIcon from "@/components/AvatarIcon";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { ui } = useTheme();
  const { t } = useTranslation();

  const [workouts, setWorkouts] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [username, setUsername] = useState("user");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!profileError && profile?.username) {
          setUsername(profile.username);
        }

        const { count, error: workoutError } = await supabase
          .from("workout_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (!workoutError && typeof count === "number") {
          setWorkouts(count);
        }
      } catch (error) {
        console.error("Failed to fetch profile info:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // NY: Badge-kort i grid
  const renderBadge = (
    icon: string,
    title: string,
    subLabel: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.badgeBox,
        {
          backgroundColor: ui.bg,
          borderColor: ui.bgLight,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.badgeIconWrap}>
        <Ionicons name={icon as any} size={26} color={ui.text} />
      </View>
      <Text style={[styles.badgeTitle, { color: ui.text }]} numberOfLines={1}>
        {title}
      </Text>
      <Text
        style={[styles.badgeSubLabel, { color: ui.textMuted }]}
        numberOfLines={2}
      >
        {subLabel}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <Header
        leftIcon={
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="person-add-outline" size={24} color={ui.text} />
          </TouchableOpacity>
        }
        title={t("navigation.profile")}
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
        <Text style={[styles.username, { color: ui.textMuted }]}>
          @{username}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: ui.text }]}>{workouts}</Text>
          <Text style={[styles.statLabel, { color: ui.textMuted }]}>
            Workouts
          </Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: ui.text }]}>
            {followers}
          </Text>
          <Text style={[styles.statLabel, { color: ui.textMuted }]}>
            Followers
          </Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: ui.text }]}>
            {following}
          </Text>
          <Text style={[styles.statLabel, { color: ui.textMuted }]}>
            Following
          </Text>
        </View>
        <TouchableOpacity style={[styles.iconButton, { borderColor: ui.text }]}>
          <Ionicons name="share-outline" size={24} color={ui.text} />
        </TouchableOpacity>
      </View>

      {/* 2×2 Badge-grid */}
      <View style={styles.badgeGrid}>
        {renderBadge(
          "walk-outline",
          "Step Master",
          "Opnåede 20k skridt på én dag",
          () => router.push("../settings/steps") // skift evt. rute
        )}
        {renderBadge(
          "flame-outline",
          "Streak King",
          "7 dages workout-streak",
          () => router.push("../settings/streaks")
        )}
        {renderBadge(
          "nutrition-outline",
          "Calorie Crusher",
          "Holdt kalorie-målet i 5 dage",
          () => router.push("../settings/food-summary")
        )}
        {renderBadge(
          "barbell-outline",
          "Gym Rat",
          "50 loggede workouts samlet",
          () => router.push("../settings/workout-history")
        )}
        {renderBadge(
          "walk-outline",
          "Step Master",
          "Opnåede 20k skridt på én dag",
          () => router.push("../settings/steps") // skift evt. rute
        )}
        {renderBadge(
          "flame-outline",
          "Streak King",
          "7 dages workout-streak",
          () => router.push("../settings/streaks")
        )}
        {renderBadge(
          "nutrition-outline",
          "Calorie Crusher",
          "Holdt kalorie-målet i 5 dage",
          () => router.push("../settings/food-summary")
        )}
        {renderBadge(
          "barbell-outline",
          "Gym Rat",
          "50 loggede workouts samlet",
          () => router.push("../settings/workout-history")
        )}
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

  // NYE styles til badge-grid
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  badgeBox: {
    width: "48.8%",            // 2 per række
    aspectRatio: 1.1,        // næsten kvadratisk
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  badgeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  badgeSubLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  badgeChevron: {
    position: "absolute",
    right: 10,
    bottom: 10,
  },
});