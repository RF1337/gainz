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
import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { scheme } = useThemeContext();
  const isDark = scheme === 'dark';

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

  const tabBarBackgroundColor = isDark ? '#1e1e1e' : '#f2f2f2';
  const activeTint = isDark ? '#ffffff' : '#000000';
  const inactiveTint = isDark ? '#cccccc' : '#888888';

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: tabBarBackgroundColor,
              height: 70,
            },
            default: {
              backgroundColor: tabBarBackgroundColor,
              height: 70,
            },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color, size }) => (
              <AnimatedTabIcon name={focused ? 'home' : 'home-outline'} color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ focused, color, size }) => (
              <AnimatedTabIcon name={focused ? 'compass' : 'compass-outline'} color={color} size={size} />
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
            tabBarIcon: ({ focused, color, size }) => (
              <AnimatedTabIcon name={focused ? 'trending-up' : 'trending-up-outline'} color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused, color, size }) => (
              <AnimatedTabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} size={size} />
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
    top: -25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabTabCenter: {
  position: 'absolute',
  bottom: 10,
  left: '50%',
  transform: [{ translateX: -30 }], // Half of width (60/2) to center it
  zIndex: 10,
},
});