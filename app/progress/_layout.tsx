// app/progress/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function ProgressLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}