import AvatarIcon from '@/components/AvatarIcon';
import Header from '@/components/Header';
import NutritionWidget from '@/components/NutritionWidget';
import ScreenWrapper from '@/components/ScreenWrapper';
import { IndexSkeleton } from '@/components/Skeletons';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { useHealthData } from '@/providers/HealthDataProvider';
import { getAllGoals, GoalKey } from '@/services/goalsService';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Index() {
  const { ui } = useTheme();
  const { t } = useTranslation();

  // ---------- Local page state (ikke HealthKit) ----------
  const [displayName, setDisplayName] = useState<string>('');
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  const [goals, setGoals] = useState<Record<GoalKey, string | null>>({
    stepGoal: null,
    waterGoal: null,
    calorieGoal: null,
    weightGoal: null,
    sleepGoal: null,
    exerciseGoal: null, // minutter
  });

  // ---------- HealthKit ----------
  const {
    initialLoading,      // første HealthKit-load (blokker side)
    refreshing,          // foreground-opdatering (blød)
    steps,
    distanceMeters,
    activeKcal,
    basalKcal,
    totalKcal,
    exerciseMinutes,
    sleepMinutes24h,
    bmi,
  } = useHealthData();

  // ---------- Fetch profile name ----------
  useEffect(() => {
    let isMounted = true;
    async function fetchDisplayName() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (!profileError && profile?.display_name && isMounted) {
          setDisplayName(profile.display_name);
        }
      } finally {
        // vi sætter ikke pageLoading her; vi venter på goals også
      }
    }

    fetchDisplayName();
    return () => { isMounted = false; };
  }, []);

  // ---------- Fetch goals hver gang siden fokuseres ----------
  useFocusEffect(
    useCallback(() => {
      let canceled = false;
      const loadGoals = async () => {
        try {
          const allGoals = await getAllGoals();
          if (!canceled) setGoals(allGoals);
        } finally {
          if (!canceled) setPageLoading(false);
        }
      };
      loadGoals();
      return () => { canceled = true; };
    }, [])
  );

  // ---------- Derived values ----------
  const stepGoalValue = useMemo(
    () => parseFloat(goals.stepGoal || '10000'),
    [goals.stepGoal]
  );
  const waterGoalValue = useMemo(
    () => parseFloat(goals.waterGoal || '3'),
    [goals.waterGoal]
  );
  const exerciseGoalMinutes = useMemo(
    () => parseFloat(goals.exerciseGoal || '120'),
    [goals.exerciseGoal]
  );
  const sleepGoalHours = useMemo(
    () => parseFloat(goals.sleepGoal || '8'),
    [goals.sleepGoal]
  );
  const calorieGoalValue = useMemo(
    () => parseFloat(goals.calorieGoal || '2500'),
    [goals.calorieGoal]
  );

  const km = useMemo(() => (distanceMeters / 1000).toFixed(2), [distanceMeters]);

  // Helper: minutes -> "7h 15m"
  const fmtMinToHM = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
    // Hvis du vil rund-op, skift til Math.round før modulo
  };

  // ---------- Loading gates ----------
  // Hele siden loader hvis: vores egen pageLoading ELLER HealthKit initialLoading
  const isPageLoading = pageLoading || initialLoading;

  if (isPageLoading) {
    return (
      <View style={{ flex: 1 }}>
        <IndexSkeleton />
      </View>
    );
  }

  // ---------- Render ----------
  return (
    <ScreenWrapper>
      <Header
        leftIcon={<AvatarIcon />}
        title={t('navigation.dashboard')}
        rightIcon={
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={ui.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.welcome}>
        <Text style={[{ fontSize: 20, color: ui.text }]}>{t('auth.welcomeBack')}</Text>
        <Text style={[{ fontSize: 20, color: ui.textMuted }]}>{displayName || 'User'}! 💪</Text>
      </View>

      {/* Steps & Activity */}
      <View style={styles.row}>
        {/* Steps */}
        <Pressable style={[styles.squareCard, styles.cardShadow, { backgroundColor: ui.bg, borderWidth: 1, borderColor: ui.bgLight }]} onPress={() => router.push('/steps')}>
          <Text style={[styles.cardTitle, { color: ui.text }]}>Steps</Text>

          <View style={styles.iconRow}>
            <View style={{ backgroundColor: '#ff797966', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Ionicons name="footsteps-outline" size={24} color={'#ff7979'} />
            </View>
            <Text style={[styles.value, { color: ui.textMuted }]}>{steps.toLocaleString()}</Text>
          </View>

          <View style={styles.iconRow}>
            <View style={{ backgroundColor: '#ff797966', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Ionicons name="walk-outline" size={24} color={'#ff7979'} />
            </View>
            <Text style={[styles.value, { color: ui.textMuted }]}>{km} km</Text>
          </View>

          <Text style={[styles.goalLabel, { color: ui.textMuted }]}>
            Goal: {goals.stepGoal || '10.000'} Steps
          </Text>

          <View style={[styles.progressBackground, { backgroundColor: ui.bgDark }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((steps / stepGoalValue) * 100, 100)}%`,
                  backgroundColor: '#ff7979',
                },
              ]}
            />
          </View>

          {refreshing && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <ActivityIndicator />
              <Text style={{ marginLeft: 6, color: ui.textMuted }}>Updating…</Text>
            </View>
          )}
        </Pressable>

        {/* Activity */}
        <View style={[styles.squareCard, styles.cardShadow, { backgroundColor: ui.bg, borderWidth: 1, borderColor: ui.bgLight }]}>
          <Text style={[styles.cardTitle, { color: ui.text }]}>Activity</Text>

          <View style={styles.iconRow}>
            <View style={{ backgroundColor: '#ff6b0066', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Ionicons name="flame-outline" size={24} color={'#ff6b00'} />
            </View>
            <Text style={[styles.value, { color: ui.textMuted }]}>{Math.round(totalKcal)} kcal</Text>
          </View>

          <View style={styles.iconRow}>
            <View style={{ backgroundColor: '#ff6b0066', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Ionicons name="time-outline" size={24} color={'#ff6b00'} />
            </View>
            <Text style={[styles.value, { color: ui.textMuted }]}>{Math.round(exerciseMinutes)} min</Text>
          </View>

          <Text style={[styles.goalLabel, { color: ui.textMuted }]}>
            Goal: {calorieGoalValue} kcal / {exerciseGoalMinutes} min
          </Text>

          {/* Vis progression på kalorier (mod calorieGoalValue) */}
          <View style={[styles.progressBackground, { backgroundColor: ui.bgDark }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((Math.round(totalKcal) / calorieGoalValue) * 100, 100)}%`,
                  backgroundColor: '#ff6b00',
                },
              ]}
            />
          </View>

          {refreshing && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <ActivityIndicator />
              <Text style={{ marginLeft: 6, color: ui.textMuted }}>Updating…</Text>
            </View>
          )}
        </View>
      </View>

      {/* Nutrition Widget */}
      <NutritionWidget />

      {/* Sleep & Water */}
      <View style={styles.row}>
        {/* Sleep */}
        <Pressable style={[styles.squareCard, styles.cardShadow, { backgroundColor: ui.bg, borderWidth: 1, borderColor: ui.bgLight }]} onPress={() => router.push('/sleep')}>
          <Text style={[styles.cardTitle, { color: ui.text }]}>Sleep</Text>

          <View style={styles.iconRow}>
            <View style={{ backgroundColor: '#67b1ff66', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Ionicons name="bed-outline" size={24} color={'#67b1ff'} />
            </View>
            <Text style={[styles.value, { color: ui.textMuted }]}>{fmtMinToHM(sleepMinutes24h)}</Text>
          </View>

          <Text style={[styles.goalLabel, { color: ui.textMuted }]}>
            Goal: {sleepGoalHours}h
          </Text>

          <View style={[styles.progressBackground, { backgroundColor: ui.bgDark }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(((sleepMinutes24h / 60) / sleepGoalHours) * 100, 100)}%`,
                  backgroundColor: '#67b1ff',
                },
              ]}
            />
          </View>

          {refreshing && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <ActivityIndicator />
              <Text style={{ marginLeft: 6, color: ui.textMuted }}>Updating…</Text>
            </View>
          )}
        </Pressable>

        {/* Water */}
        <View style={[styles.squareCard, styles.cardShadow, { backgroundColor: ui.bg, borderWidth: 1, borderColor: ui.bgLight }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: ui.text }]}>Water</Text>
            <TouchableOpacity onPress={() => router.push('/water')} style={styles.actionIcon}>
              <Ionicons name="add" size={24} color={'#67b1ff'} />
            </TouchableOpacity>
          </View>

          {/* TODO: erstat med rigtig vand-intake fra din data */}
          {/* Midlertidig placeholder */}
          <View style={styles.iconRow}>
            <View style={{ backgroundColor: '#67b1ff66', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Ionicons name="water-outline" size={24} color={'#67b1ff'} />
            </View>
            <Text style={[styles.value, { color: ui.textMuted }]}>2.5 L</Text>
          </View>

          <Text style={[styles.goalLabel, { color: ui.textMuted }]}>
            Goal: {waterGoalValue} L
          </Text>

          <View style={[styles.progressBackground, { backgroundColor: ui.bgDark }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((2.5 / waterGoalValue) * 100, 100)}%`,
                  backgroundColor: '#67b1ff',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Optional: BMI et sted i bunden */}
      {!!bmi && (
        <View style={[styles.squareCard, { backgroundColor: ui.bg, marginTop: 8 }]}>
          <View style={styles.iconRow}>
            <Ionicons name="body-outline" size={20} color={ui.textMuted} />
            <Text style={[styles.goalLabel, { marginLeft: 6, color: ui.textMuted }]}>
              BMI: {bmi.toFixed(1)}
            </Text>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  welcome: {
    paddingVertical: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginVertical: 8 },
  squareCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  cardShadow: {},
  iconRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 8 },
  progressBackground: {
    width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 4,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  value: { fontSize: 18, marginTop: 4 },
  cardTitle: { fontSize: 18, marginBottom: 8, alignSelf: 'flex-start' },
  goalLabel: { fontSize: 14, alignSelf: 'flex-start' },
  icon: { marginBottom: 4 },
  actionIcon: { fontSize: 32, alignSelf: 'center' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
});