import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

export default function FabMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const animations = useRef(buttonPositions.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(40,
      animations.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.buttonContainer}>
        {buttonPositions.map((pos, i) => {
          const translateX = animations[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, pos.x],
          });
          const translateY = animations[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, pos.y],
          });
          const scale = animations[i];

          return (
            <Animated.View
              key={i}
              style={[
                styles.actionButton,
                {
                  transform: [{ translateX }, { translateY }, { scale }],
                  opacity: scale,
                },
              ]}
            >
              <TouchableOpacity onPress={() => {
                router.push(pos.route);
                onClose(); // Close menu after navigation
              }}>
                <Ionicons name={pos.icon as any} size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const buttonPositions = [
  { x: -100, y: -75, icon: 'barcode-outline', route: '/(diet)/new' },
  { x: -55, y: -115, icon: 'barbell-outline', route: '/workouts' },
  { x: 0, y: -140, icon: 'body-outline', route: '/(measurements)/new' },
  { x: 55, y: -115, icon: 'water-outline', route: '/(water)/new' },
  { x: 100, y: -75, icon: 'scale-outline', route: '/(weight)/new' },
];

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
  },
});