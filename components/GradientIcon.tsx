import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function AnimatedGradientTabIcon({
  name,
  size = 28,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const isFocused = useIsFocused();

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.2 : 1,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <MaskedView
        style={{ width: size, height: size }}
        maskElement={
          <View style={styles.center}>
            <Ionicons name={name} size={size} color="black" />
          </View>
        }
      >
        <LinearGradient
          colors={['#FFA500', '#FF4500', '#FF0000']}
          start={[0, 0]}
          end={[1, 1]}
          style={{ flex: 1 }}
        />
      </MaskedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});