import { useTheme } from '@/theme/ThemeProvider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type Props = {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
};

export default function MacroCircle({ protein, carbs, fat, size = 120 }: Props) {
  const { ui } = useTheme();

  const total = protein + carbs + fat;
    
  const pieData = [
        {value: protein, color: '#ff595e'},
        {value: carbs, color: '#1982c4'},
        {value: fat, color: '#ffca3a'},
    ];
  
  const renderLegend = (text, color) => {
        return (
          <View style={{flexDirection: 'row', marginBottom: 12}}>
            <View
              style={{
                height: 18,
                width: 18,
                marginRight: 10,
                borderRadius: 4,
                backgroundColor: color || ui.text,
              }}
            />
            <Text style={{color: ui.text, fontSize: 16}}>{text || ''}</Text>
          </View>
        );
      };

  return (
    <View style={styles.wrapper}>
    <PieChart
      data={pieData}
      radius={60}
      donut
      innerCircleColor={ui.bg}
      innerRadius={40}
      centerLabelComponent={() => {
                return (
                  <View>
                    <Text style={{color: ui.text, fontSize: 24}}>{total}</Text>
                    <Text style={{color: ui.textMuted, fontSize: 14}}>Total</Text>
                  </View>
                );
              }}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});