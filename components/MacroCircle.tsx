import { useThemeContext } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type Props = {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
};

export default function MacroCircle({ protein, carbs, fat, size = 120 }: Props) {
  const { scheme } = useThemeContext();
  const isDark = scheme === 'dark';

  const colors = {
    background: isDark ? '#000' : '#fff',
    card: isDark ? '#1e1e1e' : '#f2f2f2',
    text: isDark ? '#fff' : '#000',
    subText: isDark ? '#aaa' : '#888',
  };

  const total = protein + carbs + fat;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const proteinLength = (protein / total) * circumference;
  const carbsLength = (carbs / total) * circumference;
  const fatLength = (fat / total) * circumference;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          {/* Protein */}
          <Circle
            stroke="#ff595e"
            fill="none"
            cx={cx}
            cy={cy}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${proteinLength}, ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Carbs */}
          <Circle
            stroke="#1982c4"
            fill="none"
            cx={cx}
            cy={cy}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${carbsLength}, ${circumference}`}
            strokeDashoffset={-proteinLength}
            strokeLinecap="round"
          />

          {/* Fat */}
          <Circle
            stroke="#ffca3a"
            fill="none"
            cx={cx}
            cy={cy}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${fatLength}, ${circumference}`}
            strokeDashoffset={-(proteinLength + carbsLength)}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.centerText }>
        <Text style={{ fontWeight: '600', fontSize: 16, color: colors.text }}>{protein + carbs + fat}g</Text>
        <Text style={{ fontSize: 12, color: colors.subText }}>Total macros</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
});