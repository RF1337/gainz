import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CalendarDate {
  date: string;
  dayLabel: string;
  dayNumber: string;
}

const generateNext7Days = (): CalendarDate[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = dayjs().add(i, 'day');
    return {
      date: d.format('YYYY-MM-DD'),
      dayLabel: d.format('ddd'), // e.g. Wed
      dayNumber: d.format('D'),  // e.g. 14
    };
  });
};

export default function CalendarComponent() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const days = generateNext7Days();

  return (
    <View style={styles.container}>
      <FlatList
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => {
          const isSelected = item.date === selectedDate;

          return (
            <TouchableOpacity
              onPress={() => setSelectedDate(item.date)}
              style={[
                styles.dateContainer,
                isSelected && styles.selectedDateContainer,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.selectedText,
                ]}
              >
                {item.dayNumber}
              </Text>
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.selectedText,
                ]}
              >
                {item.dayLabel}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  dateContainer: {
    width: 60,
    height: 80,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#bbb',
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    },
  selectedDateContainer: {
    backgroundColor: '#ff5a1f',
    },
  dayNumber: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayLabel: {
    fontSize: 14,
    color: '#999',
  },
  selectedText: {
    color: '#fff',
  },
});