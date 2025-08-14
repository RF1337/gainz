import AvatarIcon from '@/components/AvatarIcon';
import Header from '@/components/Header';
import NutritionWidget from '@/components/NutritionWidget';
import ScreenWrapper from '@/components/ScreenWrapper';
import { IndexSkeleton } from '@/components/Skeletons';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { getAllGoals, GoalKey } from '@/services/goalsService';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Index({ loading }: { loading: boolean }) {
  const { ui } = useTheme();
  const [displayName, setDisplayName] = useState<string>("");

  /* Date logic
  const date = new Date().toLocaleDateString('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Copenhagen',
  });
  const formatted = date.charAt(0).toUpperCase() + date.slice(1);
  */

  const { t } = useTranslation();

  useEffect(() => {
    async function fetchDisplayName() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (!profileError && profile?.display_name) {
        setDisplayName(profile.display_name);
      }
    }

    fetchDisplayName();
  }, []);

  const [goals, setGoals] = useState<Record<GoalKey, string | null>>({
    stepGoal: null,
    waterGoal: null,
    calorieGoal: null,
    weightGoal: null,
    sleepGoal: null,
    exerciseGoal: null,
  });

 useFocusEffect(
  useCallback(() => {
    const loadGoals = async () => {
      const allGoals = await getAllGoals();
      setGoals(allGoals);
    };

    loadGoals();
  }, [])
);


  const waterIntake = '2.5';

  const stepGoalValue = parseFloat(goals.stepGoal || '10000');
  const waterGoalValue = parseFloat(goals.waterGoal || '3');
  const waterIntakeValue = parseFloat(waterIntake || '0');
  const exerciseGoalValue = parseFloat(goals.exerciseGoal || '120');
  const sleepGoalValue = parseFloat(goals.sleepGoal || '8');

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <IndexSkeleton />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        leftIcon={
          <AvatarIcon />
        }
        title={t('navigation.dashboard')}
        rightIcon={
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={24} color={ui.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.welcome}>
        <Text style={[{fontSize: 20, color: ui.text }]}>{t('auth.welcomeBack')}</Text>
        <Text style={[{fontSize: 20, color: ui.textMuted }]}>{displayName || "User"}! 💪</Text>
    </View>

        {/* Steps & Activity */}
        <View style={styles.row}>
          <View style={[styles.squareCard, styles.cardShadow, { backgroundColor: ui.bg }]}>
            <Text style={[styles.cardTitle, { color: ui.text }]}>Steps</Text>
            <View style={styles.iconRow}>
              <View style={{backgroundColor: "#ff7979" + 40, borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Ionicons name="footsteps-outline" size={24} color={'#ff7979'} />
              </View>
            <Text style={[styles.value, { color: ui.textMuted }]}>8.420</Text>
            </View>
            <View style={styles.iconRow}>
              <View style={{backgroundColor: "#ff7979" + 40, borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Ionicons name="walk-outline" size={24} color={'#ff7979'} />
              </View>
              <Text style={[styles.value, { color: ui.textMuted }]}>3.740 m</Text>
            </View>
            <Text style={[styles.goalLabel, { color: ui.textMuted }]}>Goal: {goals.stepGoal || '10.000'} Steps</Text>
            <View style={[styles.progressBackground, { backgroundColor: ui.bgDark }]}>
              <View style={[styles.progressFill, { width: `${(8420 / stepGoalValue) * 100}%`, backgroundColor: '#ff7979' }]} />
            </View>
          </View>

          <View style={[styles.squareCard, styles.cardShadow, { backgroundColor: ui.bg }]}>
            <Text style={[styles.cardTitle, { color: ui.text }]}>Activity</Text>
            <View style={styles.iconRow}>
              <View style={{backgroundColor: "#ff6b00" + 40, borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Ionicons name="flame-outline" size={24} color={'#ff6b00'} />
              </View>
              <Text style={[styles.value, { color: ui.textMuted }]}>300 kcal</Text>
            </View>
            <View style={styles.iconRow}>
              <View style={{backgroundColor: "#ff6b00" + 40, borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Ionicons name="time-outline" size={24} color={'#ff6b00'} />
              </View>
              <Text style={[styles.value, { color: ui.textMuted }]}>45 min</Text>
            </View>
            <Text style={[styles.goalLabel, { color: ui.textMuted }]}>Goal: {goals.exerciseGoal || '300'} kcal</Text>
            <View style={[styles.progressBackground, { backgroundColor: ui.bgDark }]}>
              <View style={[styles.progressFill, { width: `${(300 / exerciseGoalValue) * 100}%`, backgroundColor: '#ff6b00' }]} />
            </View>
          </View>
        </View>

        {/* Nutrition Widget */}
        <NutritionWidget/>


        {/*
        <View style={[styles.wideCard, { backgroundColor: ui.bg }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: ui.textMuted }]}>Nutrition</Text>
            <TouchableOpacity onPress={() => router.push('/scanner')} style={styles.actionIcon}>
              <Ionicons name="add" size={24} color={ui.nutritionAddColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.calorieRow}>
            <View style={{ flexDirection: 'row', alignContent: 'center' }}>
              <Ionicons name="fast-food-outline" size={24} color={ui.text} style={styles.icon} />
              <Text style={[styles.value, { color: ui.text, marginLeft: 8 }]}>{Math.ceil(todayNutrition.calories)} Calories</Text>
            </View>

            <View style={{ flexDirection: 'column', alignContent: 'center' }}>
              <MacroCircle
                carbs={Math.ceil(todayNutrition.carbs)}
                protein={Math.ceil(todayNutrition.protein)}
                fat={Math.ceil(todayNutrition.fat)}
                size={120}
              />
            </View>
          </View>
        </View>
        */}
        
        {/* Sleep & Water */}
        <View style={styles.row}>
          <View style={[styles.squareCard, styles.cardShadow, { backgroundColor: ui.bg }]}>
            <Text style={[styles.cardTitle, { color: ui.text }]}>Sleep</Text>
            <View style={styles.iconRow}>
              <View style={{backgroundColor: "#67b1ff" + 40, borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Ionicons name="bed-outline" size={24} color={'#67b1ff'} />
              </View>                  
              <Text style={[styles.value, { color: ui.textMuted }]}>7h 15m</Text>
            </View>
            <Text style={[styles.goalLabel, { color: ui.textMuted }]}>Goal: {goals.sleepGoal || '8'}h</Text>
            <View style={[styles.progressBackground, { backgroundColor: ui.bgDark }]}>
              <View style={[styles.progressFill, { width: `${(7.25 / sleepGoalValue) * 100}%`, backgroundColor: '#67b1ff' }]} />
            </View>
          </View>

          <View style={[styles.squareCard, styles.cardShadow, { backgroundColor: ui.bg }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: ui.text }]}>Water</Text>
              <TouchableOpacity onPress={() => router.push('/water')} style={styles.actionIcon}>
                <Ionicons name="add" size={24} color={'#67b1ff'} />
              </TouchableOpacity>
            </View>
            <View style={styles.iconRow}>
                <View style={{backgroundColor: "#67b1ff" + 40, borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Ionicons name="water-outline" size={24} color={'#67b1ff'} />
                </View>   
                <Text style={[styles.value, { color: ui.textMuted }]}>{waterIntake || 'No data'} L</Text>
            </View>
            <Text style={[styles.goalLabel, { color: ui.textMuted }]}>Goal: {goals.waterGoal || '3'} L</Text>
            <View style={[styles.progressBackground, { backgroundColor: ui.bgDark }]}>
              <View style={[styles.progressFill, { width: `${(waterIntakeValue / waterGoalValue) * 100}%`, backgroundColor: '#67b1ff' }]} />
            </View>
          </View>
        </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  welcome: {
    paddingVertical: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginVertical: 8 },
  squareCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center'},
  cardShadow: {

  },
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