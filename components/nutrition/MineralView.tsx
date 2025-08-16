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

export default function MacroView({ data }: Props) {
  const { ui } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: ui.text }]}>Today's intake</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/scanner')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={ui.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Macro Circle */}
        <View>
          <CalorieCircle
            calories={Math.ceil(data.calories)}
            caloriesGoal={2000}
            radius={60}
            thickness={20}
          />
        </View>
        <View>
          <Text style={[styles.caloriesLabel, { color: ui.text }]}>
            Base goal
          </Text>
          <Text style={[styles.caloriesLabel, { color: ui.text }]}>
            Food
          </Text>
          <Text style={[styles.caloriesLabel, { color: ui.text }]}>
            Burnt
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ikke noget kort/shadow her – det styres af overordnet widget
  container: {
    padding: 0,
    width: SCREEN_WIDTH - 64,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titleContainer: {
    flexDirection: 'row',
  },

  title: {
    fontSize: 18,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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