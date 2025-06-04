import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function AnimatedTabIcon({
  name,
  color,
  size = 24,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  const isFocused = useIsFocused();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.15 : 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}
