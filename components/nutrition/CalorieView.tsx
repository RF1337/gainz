import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CalorieCircle from '../CalorieCircle';

type Props = {
  data: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

export default function CalorieView({ data }: Props) {
  const { ui } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: ui.text }]}>Today's intake</Text>

        <TouchableOpacity
          onPress={() => router.push('/scanner')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={ui.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Circle column */}
        <View style={{ width: 120, alignItems: 'center' }}>  {/* 2 * radius = 120 */}
          <CalorieCircle calories={Math.ceil(data.calories)} caloriesGoal={2000} radius={60} thickness={20} />
        </View>

        {/* Labels column */}
        <View style={{ height: 120, justifyContent: 'space-evenly', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#00d9ff66', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                    <Ionicons name="flag-outline" size={24} color={'#00d9ff'} />
                </View>                
                <View>
                    <Text style={[styles.caloriesLabel, { color: ui.text }]}>Base goal</Text>
                    <Text style={[styles.caloriesLabel, { color: ui.textMuted }]}>2000 kcal</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#ff6b0066', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                    <Ionicons name="flame-outline" size={24} color={'#ff6b00'} />
                </View>                
                <View>
                    <Text style={[styles.caloriesLabel, { color: ui.text }]}>Exercise</Text>
                    <Text style={[styles.caloriesLabel, { color: ui.textMuted }]}>366 kcal</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#1eff0066', borderRadius: 50, height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                    <Ionicons name="restaurant-outline" size={24} color={'#1eff00ff'} />
                </View>                
                <View>
                    <Text style={[styles.caloriesLabel, { color: ui.text }]}>Food</Text>
                    <Text style={[styles.caloriesLabel, { color: ui.textMuted }]}>1.200</Text>
                </View>
            </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ikke noget kort/shadow her – det styres af overordnet widget
  container: {
    flex: 1,
    width: SCREEN_WIDTH - 64,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    },

  caloriesLabel: {
    fontSize: 20,
  },

  caloriesValue: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
    marginBottom: 2,
  },

  caloriesUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
});