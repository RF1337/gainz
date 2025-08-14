// app/(tabs)/workout-logs.tsx

import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useTheme } from "@/theme/ThemeProvider";
import React, { useState } from "react";
import {
  StyleSheet
} from "react-native";
import { Calendar } from 'react-native-calendars';

export default function WorkoutLogsScreen() {
  const { ui } = useTheme();

  const [selectedDate, setSelectedDate] = useState('');

    return (
      <ScreenWrapper>
        <Header 
        leftIcon={<BackButton />}
        title="Workouts"
        />
        <Calendar
          // Customize the appearance of the calendar
          style={{
            backgroundColor: ui.bg,
          }}
          onDayPress={day => {
            setSelectedDate(day.dateString);
          }}
          markedDates={{
            [selectedDate]: {selected: true, disableTouchEvent: true, selectedColor: 'orange'}
          }}
        /> 
      </ScreenWrapper>
    );
  };

const styles = StyleSheet.create({
});
