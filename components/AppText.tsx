// components/AppText.tsx
import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';

export default function AppText(props: TextProps) {
  return <RNText {...props} style={[styles.text, props.style]} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Inter_400Regular',  // your global font here
  },
});