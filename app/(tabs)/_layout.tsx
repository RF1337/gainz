import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import AnimatedTabIcon from '@/components/AnimatedTabIcon';
import FabMenu from '@/components/FabMenu';
import { HapticTab } from '@/components/HapticTab';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { ui } = useTheme();

  const [fabVisible, setFabVisible] = useState(false);
  const toggleFabMenu = () => setFabVisible(!fabVisible);

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: fabVisible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [fabVisible]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'], // Rotates 45 degrees to make an "X"
  });

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: ui.text,
          tabBarInactiveTintColor: ui.textMuted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              borderTopColor: ui.bg,
              backgroundColor: ui.bg,
              height: 85,
            },
            default: {
              borderTopWidth: 0,
              backgroundColor: ui.bg,
              height: 85,
            },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, size }) => (
              <AnimatedTabIcon name={focused ? 'home' : 'home-outline'} color={ui.textMuted} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ focused, size }) => (
              <AnimatedTabIcon name={focused ? 'compass' : 'compass-outline'} color={ui.textMuted} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="quickadd"
          options={{
            tabBarLabel: () => null,
            tabBarButton: () => (
              <TouchableOpacity
                onPress={toggleFabMenu}
                style={[styles.fabTab, styles.fabTabCenter]}
                activeOpacity={0.8}
              >
                <Animated.View style={{ transform: [{ rotate }] }}>
                  <Ionicons name="add" size={32} color="#fff" />
                </Animated.View>
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ focused, size }) => (
              <AnimatedTabIcon name={focused ? 'trending-up' : 'trending-up-outline'} color={ui.textMuted} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused, size }) => (
              <AnimatedTabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={ui.textMuted} size={size} />
            ),
          }}
        />
      </Tabs>

      {/* FAB menu toggle */}
      {fabVisible && <FabMenu onClose={() => setFabVisible(false)} />}
    </>
  );
}

const styles = StyleSheet.create({
  fabTab: {
    top: 0,
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "rgba(0, 128, 255, 1)",
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabTabCenter: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -25 }], // Half of width (60/2) to center it
    zIndex: 10,
  },
});