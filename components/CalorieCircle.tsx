import { useTheme } from '@/theme/ThemeProvider';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type Props = {
  calories: number;      // eaten
  caloriesGoal: number;  // daily goal
  radius?: number;
  thickness?: number;    // donut thickness = radius - innerRadius
};

export default function CalorieCircle({
  calories,
  caloriesGoal,
  radius = 60,
  thickness = 20,
}: Props) {
  const { ui } = useTheme();

  const { data, percent, consumed, remaining, overflow } = useMemo(() => {
    const goal = Math.max(0, Math.floor(caloriesGoal || 0));
    const eaten = Math.max(0, Math.floor(calories || 0));

    if (goal <= 0) {
      // No goal set: just show what’s eaten as a full ring
      return {
        data: [{ value: 1, color: ui.primary }], // single slice
        percent: 100,
        consumed: eaten,
        remaining: 0,
        overflow: 0,
      };
    }

    const consumed = Math.min(eaten, goal);
    const remaining = Math.max(goal - consumed, 0);
    const overflow = Math.max(eaten - goal, 0);

    // Base slices: consumed vs remaining-to-goal
    const slices = [
      { value: consumed, color: ui.primary },
      { value: remaining, color: ui.border }, // muted track
    ];

    // Optional third slice for overflow past goal
    if (overflow > 0) {
      slices.push({ value: overflow, color: '#e74c3c' }); // or ui.negative if you have it
    }

    const percent = Math.min(100, (eaten / goal) * 100);

    return { data: slices, percent, consumed: eaten, remaining, overflow };
  }, [calories, caloriesGoal, ui]);

  const innerRadius = Math.max(0, radius - thickness);

  return (
    <View style={styles.wrapper}>
      <PieChart
        donut
        radius={radius}
        innerRadius={innerRadius}
        innerCircleColor={ui.bg}
        data={data}
        isAnimated
        animationDuration={600}
        centerLabelComponent={() => (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: ui.text }}>
              {consumed.toLocaleString()} kcal
            </Text>
            {caloriesGoal > 0 ? (
              <Text style={{ fontSize: 12, color: ui.textMuted }}>
                {Math.round(percent)}% of {caloriesGoal.toLocaleString()}
              </Text>
            ) : (
              <Text style={{ fontSize: 12, color: ui.textMuted }}>No goal</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { justifyContent: 'center', alignItems: 'center' },
});