import { useTheme } from '@/theme/ThemeProvider'; // Adjust import path
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface WeeklySummaryProps {
  workouts: number;
  totalTime: number; // in minutes
  calories: number;
  streak: number;
  onPress?: () => void;
}

const WeeklySummaryWidget: React.FC<WeeklySummaryProps> = ({
  workouts = 4,
  totalTime = 240, // 4 hours
  calories = 1200,
  streak = 3,
  onPress
}) => {
  const { ui } = useTheme();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const StatItem = ({ icon, value, label, color }: {
    icon: string;
    value: string | number;
    label: string;
    color: string;
  }) => (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: ui.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: ui.textMuted }]}>{label}</Text>
    </View>
  );

  return (
    <View>
      <Text style={[styles.summaryTitle, { color: ui.text }]}>Your weekly summary</Text>
      
      <Pressable style={[styles.widget, {backgroundColor: ui.bg}]} onPress={onPress}>
        {/* Header with streak */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.weekLabel, { color: ui.textMuted }]}>This Week</Text>
            <Text style={[styles.weekRange, { color: ui.text }]}>Dec 2-8</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: ui.primary }]}>
            <Ionicons name="flame" size={16} color="#FFF" />
            <Text style={styles.streakText}>{streak} day streak</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatItem
            icon="fitness"
            value={workouts}
            label="Workouts"
            color="#FF6B6B"
          />
          <StatItem
            icon="time-outline"
            value={formatTime(totalTime)}
            label="Total Time"
            color="#4ECDC4"
          />
          <StatItem
            icon="flame-outline"
            value={calories.toLocaleString()}
            label="Calories"
            color="#FFD93D"
          />
          <StatItem
            icon="trophy-outline"
            value="12"
            label="PRs Set"
            color="#6BCF7F"
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryTitle: {
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 12,
  },
  widget: {
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  weekLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  weekRange: {
    fontSize: 16,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  activitySection: {
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: 12,
    marginBottom: 12,
  },
  activityDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  dayContainer: {
    alignItems: 'center',
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default WeeklySummaryWidget;