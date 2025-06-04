import MacroCircle from '@/components/MacroCircle';
import ProfileWrapper from '@/components/ProfileWrapper';
import { useThemeContext } from '@/context/ThemeContext';
import { getAllGoals, GoalKey } from '@/services/goalsService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { scheme } = useThemeContext();
  const isDark = scheme === 'dark';

  const colors = {
    background: isDark ? '#000' : '#fff',
    card: isDark ? '#1e1e1e' : '#f2f2f2',
    text: isDark ? '#fff' : '#000',
    subText: isDark ? '#aaa' : '#888',
  };

  const date = new Date().toLocaleDateString('da-DK', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Copenhagen',
  });
  // Format the date to remove "den".
  const formatted = date.charAt(0).toUpperCase() + date.slice(1);

  // Fetch goals from AsyncStorage
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

const waterIntake = '2.5'; // Placeholder for water intake, replace with actual data fetching logic

const stepGoalValue = parseFloat(goals.stepGoal || '10000');
const waterGoalValue = parseFloat(goals.waterGoal || '3');
const waterIntakeValue = parseFloat(waterIntake || '0');
const calorieGoalValue = parseFloat(goals.calorieGoal || '2000');
const weightGoalValue = parseFloat(goals.weightGoal || '70');
const sleepGoalValue = parseFloat(goals.sleepGoal || '8');
const exerciseGoalValue = parseFloat(goals.exerciseGoal || '120'); // in minutes


  if (Platform.OS === 'ios') {
    // brug HealthKit
  } else {
    // brug Google Fit
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
    <ScrollView style={{ paddingHorizontal: 20 }}>
    <ProfileWrapper>
      <Text style={[styles.title, { color: colors.text }]}>{formatted}</Text>

      {/* Top 2 square widgets: Steps & Activity */}
      <View style={styles.row}>
        {/* Steps */}
        <View style={[styles.squareCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.subText }]}>Steps</Text>

          <View style={styles.iconRow}>
            <Ionicons name="footsteps-outline" size={20} color="#ff7979" style={{ marginRight: 8 }} />
            <Text style={[styles.value, { color: colors.text }]}>8.420</Text>
          </View>
           <View style={styles.iconRow}>
            <Ionicons name="walk-outline" size={20} color="#ff7979" style={{ marginRight: 8 }} />
            <Text style={[styles.value, { color: colors.text }]}>3.740 m</Text>
          </View>

          <Text style={[styles.goalLabel, { color: colors.subText }]}>
            Goal: {goals.stepGoal ? `${goals.stepGoal} steps` : '10.000 steps'}
          </Text>

          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${(8420 / stepGoalValue) * 100}%`, backgroundColor: '#ff7979' }]} />
          </View>
        </View>

        {/* Activity */}
        <View style={[styles.squareCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.subText }]}>Activity</Text>

          <View style={styles.iconRow}>
            <Ionicons name="flame-outline" size={24} color="#ff6b00" style={{ marginRight: 8}} />
            <Text style={[styles.value, { color: colors.text }]}>300 kcal</Text>
          </View>
          <View style={styles.iconRow}>
            <Ionicons name="time-outline" size={24} color="#ff6b00" style={{ marginRight: 8}} />
            <Text style={[styles.value, { color: colors.text }]}>45 min</Text>
          </View>
          <Text style={[styles.goalLabel, { color: colors.subText }]}>
            Goal: {goals.exerciseGoal ? `${goals.exerciseGoal} kcal` : '300 kcal'}
          </Text>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${(300 / exerciseGoalValue) * 100}%`, backgroundColor: '#ff6b00' }]} />
          </View>
        </View>
      </View>

      {/* Wide widget: Food */}
      <View style={[styles.wideCard, { backgroundColor: colors.card }]}>
  {/* Title */}
  <Text style={[styles.cardTitle, { color: colors.subText }]}>Diet</Text>

  <View style={styles.calorieRow}>
    <View style={{ flexDirection: 'row', alignContent: 'center' }}>
      <Ionicons name="fast-food-outline" size={24} color={colors.text} style={styles.icon} />
      <Text style={[styles.value, { color: colors.text, marginLeft: 8 }]}>2,150 kcal</Text>
    </View>
    <View style={{ flexDirection: 'column', alignContent: 'center' }}>
    <MacroCircle protein={120} carbs={240} fat={80} size={120} />
    {/* Macros under chart, centered */}
    <View style={styles.macroRow}>
      <View style={styles.macroItem}>
        <Ionicons name="ellipse" size={12} color="#ff595e" style={styles.macroIcon} />
        <Text style={styles.macroText}>Protein</Text>
      </View>
      <View style={styles.macroItem}>
        <Ionicons name="ellipse" size={12} color="#1982c4" style={styles.macroIcon} />
        <Text style={styles.macroText}>Carbs</Text>
      </View>
      <View style={styles.macroItem}>
        <Ionicons name="ellipse" size={12} color="#ffca3a" style={styles.macroIcon} />
        <Text style={styles.macroText}>Fat</Text>
      </View>
    </View>
    </View>
  </View>
</View>

      {/* Bottom 2 square widgets: Sleep & Hydration */}
      <View style={styles.row}>
        {/* Sleep */}
        <View style={[styles.squareCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.subText }]}>Sleep</Text>

          <View style={styles.iconRow}>
            <Ionicons name="bed-outline" size={24} color="#a29bfe" style={{ marginRight: 8}} />
            <Text style={[styles.value, { color: colors.text }]}>7h 15m</Text>
          </View>

          <Text style={[styles.goalLabel, { color: colors.subText }]}>
            Goal: {goals.sleepGoal ? `${goals.sleepGoal}h` : '8h'}
          </Text>

          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${(7.25 / sleepGoalValue) * 100}%`, backgroundColor: '#a29bfe' }]} />
          </View>
        </View>

        {/* Water */}
        <View style={[styles.squareCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.subText }]}>Water</Text>
          <TouchableOpacity onPress={() => router.push('/(water)/new')} style={styles.actionIcon}>
            <Ionicons name="add" size={24} color="#67b1ff" />
          </TouchableOpacity>
        </View>

          <View style={styles.iconRow}>
            <Ionicons name="water-outline" size={24} color="#67b1ff" style={{ marginRight: 8}} />
            <Text style={[styles.value, { color: colors.text }]}>
              {waterIntake ? `${waterIntake} L` : 'No data'}
            </Text>
          </View>

          <Text style={[styles.goalLabel, { color: colors.subText }]}>
            Goal: {goals.waterGoal ? `${goals.waterGoal} L` : '3 L'}
          </Text>
          
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${(waterIntakeValue/waterGoalValue) * 100}%`, backgroundColor: '#67b1ff' }]} />
          </View>
        </View>
      </View>
    </ProfileWrapper>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  squareCard: {
    flex: 1,
    padding: 12,
    gap: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  wideCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginTop: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  icon: {
    marginBottom: 4,
  },
  macroRow: {
  flexDirection: 'row',
  gap: 4,
  marginTop: 20,
  width: '100%',
},
macroItem: {
  flexDirection: 'row',
  alignItems: 'center',
},
macroIcon: {
  marginRight: 6,
},
macroText: {
  fontSize: 14,
  color: '#888',
},
progressBackground: {
  width: '100%',
  height: 8,
  borderRadius: 4,
  backgroundColor: '#555',
  overflow: 'hidden',
},
progressFill: {
  height: '100%',
  backgroundColor: '#4ca3ff',
  borderRadius: 4,
},
cardTitle: {
  fontSize: 17,
  marginBottom: 8,
  alignSelf: 'flex-start',
},
iconRow: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  marginBottom: 8,
},
goalLabel: {
  fontSize: 12,
  alignSelf: 'flex-start',
},

calorieRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
},
actionIcon: {
  fontSize: 32,
  alignSelf: 'center',  
},
cardHeaderRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
},
});