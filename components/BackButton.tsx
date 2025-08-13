import { useTheme } from '@/theme/ThemeProvider';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from "react-native-svg";

export default function BackButton() {
  const {ui} = useTheme();

  return (
    <View style={{ flexDirection: 'row' }}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Svg
          width={22}
          height={17}
          viewBox="0 0 22 22"
          fill="none"
        >
          <Path
            d="M28 12H4 M4 12L12 4 M4 12L12 20"
            stroke={ui.text}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </View>
  );
}