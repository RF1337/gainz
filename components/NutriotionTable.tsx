import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from 'react-native';
import MacroView from './nutrition/MacroView';
import MineralView from './nutrition/MineralView';
import VitaminView from './nutrition/VitaminView';

const { width } = Dimensions.get('window');

export default function NutritionWidget() {
  const { ui } = useTheme();

  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    vitaminC: 0,
    iron: 0,
    magnesium: 0,
  });

  const [pageIndex, setPageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchNutrition = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id;
      if (!user_id) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('food_entries')
        .select('calories, protein, carbs, fat, vitamin_c, iron, magnesium')
        .eq('user_id', user_id)
        .gte('created_at', today.toISOString());

      if (error) {
        console.error('Failed to fetch food entries:', error.message);
        return;
      }

      const totals = data.reduce(
        (acc, item) => {
          acc.calories += item.calories ?? 0;
          acc.protein += item.protein ?? 0;
          acc.carbs += item.carbs ?? 0;
          acc.fat += item.fat ?? 0;
          acc.vitaminC += item.vitamin_c ?? 0;
          acc.iron += item.iron ?? 0;
          acc.magnesium += item.magnesium ?? 0;
          return acc;
        },
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          vitaminC: 0,
          iron: 0,
          magnesium: 0,
        }
      );

      setNutrition(totals);
    };

    fetchNutrition();
  }, []);

  const pages = [
    { key: 'macros', component: <MacroView data={nutrition} /> },
    { key: 'vitamins', component: <VitaminView data={nutrition} /> },
    { key: 'minerals', component: <MineralView data={nutrition} /> },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setPageIndex(newIndex);
  };

  return (
    <>
      {/* Widget card */}
      <View style={[styles.container, { backgroundColor: ui.bg }]}>
        <FlatList
          data={pages}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => <View style={{ width }}>{item.component}</View>}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ref={flatListRef}
        />
      </View>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === pageIndex ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: '#888',
  },
});