import AvatarIcon from '@/components/AvatarIcon';
import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RadarChart } from 'react-native-gifted-charts';

const CARD_WIDTH = (Dimensions.get('window').width);
const CARD_HEIGHT = 100;

export default function ProgressScreen() {
  const {ui} = useTheme();
  const { t } = useTranslation();

  return (
      <ScreenWrapper>
      <Header
        leftIcon={
          <AvatarIcon />
        }
        title={t('navigation.progress')}
        rightIcon={
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={24} color={ui.text} />
          </TouchableOpacity>
        }
      />
      {/*
          '#ff0076', '#590fb7'
          '#0b63f6', '#003cc5'
      */}

      <View style={styles.grid}>
        <Pressable
          style={[styles.card, styles.cardShadow, { backgroundColor: ui.bg }]}
          onPress={() => router.push('/progress/workout-logs' as any)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="barbell-outline" size={24} color={ui.textMuted} />
          </View>
          <View>
            <Text style={[styles.label, { color: ui.text }]}>Workouts</Text>
            <Text style={[styles.label, { color: ui.textMuted }]}>Check your workout history</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardShadow, { backgroundColor: ui.bg }]}
          onPress={() => router.push('/progress/strength-progression' as any)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="barbell-outline" size={24} color={ui.textMuted} />
          </View>
          <View>
            <Text style={[styles.label, { color: ui.text }]}>Strength</Text>
            <Text style={[styles.label, { color: ui.textMuted }]}>Check your workout history</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardShadow, { backgroundColor: ui.bg }]}
          onPress={() => router.push('/progress/measurements' as any)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="body-outline" size={24} color={ui.textMuted} />
          </View>
          <View>
            <Text style={[styles.label, { color: ui.text }]}>Measurements</Text>
            <Text style={[styles.label, { color: ui.textMuted }]}>Check your workout history</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardShadow, { backgroundColor: ui.bg }]}
          onPress={() => router.push('/progress/weight' as any)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="scale-outline" size={24} color={ui.textMuted} />
          </View>
          <View>
            <Text style={[styles.label, { color: ui.text }]}>Weight</Text>
            <Text style={[styles.label, { color: ui.textMuted }]}>Check your workout history</Text>
          </View>
        </Pressable>

      </View>
      <View style={{ backgroundColor: ui.bg, width: '100%', borderRadius: 12}}>
      <RadarChart data={[54, 53, 55, 52, 51, 55]}
            labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            labelConfig={{stroke: ui.text, fontWeight: 'bold'}}
            maxValue={65}
            hideGrid
            polygonConfig={
              {
                strokeWidth: 2,
                stroke: ui.text,
                fill: ui.textMuted,
                isAnimated: true,
                animationDuration: 500,
              }
            }
             />
              </View>

      </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginTop: 8
  },
  iconContainer: {
    width: '16%',
    marginRight: 6,
    alignItems: 'center',
  },
  card: {
    flex:1,
    padding: 24,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
    cardShadow: {

  },
  label: {
    fontSize: 16,
    marginTop: 6,
  },
  summaryWidget: {
    borderRadius: 5,
  },
});