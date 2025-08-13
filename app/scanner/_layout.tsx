// app/settings/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function NutritionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}