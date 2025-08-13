// app/progress/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function WorkoutsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_left',
        animationDuration: 200,
      }}
    />
  );
}