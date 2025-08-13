import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.8;
const DISMISS_THRESHOLD = SCREEN_HEIGHT * 0.3;
const ITEM_HEIGHT = 50;

interface MeasurementPickerProps {
  title?: string; // Custom title for the picker
  initialValue?: number; // in cm (e.g., 175.5)
  onValueChange?: (value: number) => void;
  onConfirm?: (value: number) => void;
  onDismiss?: () => void;
}

export default function MeasurementPicker({ 
  title = "Select Measurement",
  initialValue = 170.0, 
  onValueChange, 
  onConfirm, 
  onDismiss 
}: MeasurementPickerProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });

  const [cm, setCm] = useState(Math.floor(initialValue));
  const [mm, setMm] = useState(Math.round((initialValue % 1) * 10));

  const cmListRef = useRef<FlatList>(null);
  const mmListRef = useRef<FlatList>(null);

  // Create infinite scrolling arrays
  const cmList = Array.from({ length: 301 }, (_, i) => i); // 0-300
  const mmList = Array.from({ length: 10 }, (_, i) => i);  // 0-9

  const selectedValue = parseFloat((cm + mm / 10).toFixed(1));

  const scrollTo = (dest: number) => {
    'worklet';
    translateY.value = withSpring(dest, { damping: 40 });
  };

  useEffect(() => {
    scrollTo(SCREEN_HEIGHT - MAX_HEIGHT);
  }, []);

  useEffect(() => {
    onValueChange?.(selectedValue);
  }, [selectedValue, onValueChange]);

  const handleCmScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    const index = Math.round(offset / ITEM_HEIGHT);
    setCm(Math.max(0, Math.min(300, index)));
  };

  const handleMmScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    const index = Math.round(offset / ITEM_HEIGHT);
    setMm(index % 10); // Loop back to 0 after 9
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((e) => {
      translateY.value = Math.max(
        context.value.y + e.translationY,
        SCREEN_HEIGHT - MAX_HEIGHT
      );
    })
    .onEnd(() => {
      if (translateY.value > SCREEN_HEIGHT - DISMISS_THRESHOLD) {
        scrollTo(SCREEN_HEIGHT);
        setTimeout(() => onDismiss?.(), 300);
      } else {
        scrollTo(SCREEN_HEIGHT - MAX_HEIGHT);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleConfirm = () => {
    onConfirm?.(selectedValue);
    scrollTo(SCREEN_HEIGHT);
    setTimeout(() => onDismiss?.(), 300);
  };

  const renderCmItem = ({ item, index }: { item: number; index: number }) => {
    const isSelected = item === cm;
    return (
      <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
        <Text style={[styles.item, isSelected && styles.selectedText]}>
          {item}
        </Text>
        <Text style={[styles.unit, isSelected && styles.selectedText]}>
          cm
        </Text>
      </View>
    );
  };

  const renderMmItem = ({ item, index }: { item: number; index: number }) => {
    const isSelected = item === mm;
    return (
      <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
        <Text style={[styles.item, isSelected && styles.selectedText]}>
          {item}
        </Text>
        <Text style={[styles.unit, isSelected && styles.selectedText]}>
          mm
        </Text>
      </View>
    );
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.sheet, animatedStyle]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>

        <View style={styles.pickerContainer}>
          <View style={styles.pickerRow}>
            <View style={styles.pickerColumn}>
              <FlatList
                ref={cmListRef}
                data={cmList}
                keyExtractor={(item) => `cm-${item}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={styles.listContainer}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                initialScrollIndex={cm}
                onMomentumScrollEnd={handleCmScroll}
                renderItem={renderCmItem}
              />
            </View>

            <View style={styles.pickerColumn}>
              <FlatList
                ref={mmListRef}
                data={mmList}
                keyExtractor={(item) => `mm-${item}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={styles.listContainer}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                initialScrollIndex={mm}
                onMomentumScrollEnd={handleMmScroll}
                renderItem={renderMmItem}
              />
            </View>
          </View>

          {/* Selection indicator overlay */}
          <View style={styles.selectionIndicator} />
        </View>

        <Text style={styles.result}>
          Selected: {selectedValue} cm
        </Text>

        <View style={styles.buttonRow}>
          <Pressable 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => {
              scrollTo(SCREEN_HEIGHT);
              setTimeout(() => onDismiss?.(), 300);
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          
          <Pressable style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm</Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    zIndex: 1000,
  },
  handle: {
    width: 75,
    height: 4,
    backgroundColor: '#888',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerContainer: {
    height: 250,
    position: 'relative',
    marginBottom: 24,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 20,
  },
  listContainer: {
    paddingVertical: 100, // Center the first/last items
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
    marginHorizontal: 8,
  },
  selectedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#1e90ff',
  },
  item: {
    fontSize: 24,
    color: '#888',
    fontWeight: '500',
    marginRight: 4,
  },
  unit: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -ITEM_HEIGHT / 2,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
  result: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#1e90ff',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});