// app/(auth)/index.tsx
import { Redirect } from 'expo-router';
import React from 'react';

export default function AuthIndex() {
  // jump straight to the SignUp screen
  return <Redirect href="/(auth)/sign-up" />;
}