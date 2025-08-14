import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import MacroView from './nutrition/MacroView';
import MineralView from './nutrition/MineralView';
import VitaminView from './nutrition/VitaminView';

type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitaminC: number;
  iron: number;
  magnesium: number;
};

export default function NutritionWidget() {
  const { ui } = useTheme();
  const [pageWidth, setPageWidth] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const [nutrition, setNutrition] = useState<NutritionTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    vitaminC: 0,
    iron: 0,
    magnesium: 0,
  });

useEffect(() => {
  (async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;
    if (!user_id) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    type FoodEntryWithFood = {
      quantity: number;
      foods: {
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
        vitamin_c: number | null;
        iron: number | null;
        magnesium: number | null;
      } | null;
    };

    const { data, error } = await supabase
      .from('food_entries')
      .select(`
        quantity,
        foods (
          calories,
          protein,
          carbs,
          fat,
          vitamin_c,
          iron,
          magnesium
        )
      `)
      .eq('user_id', user_id)
      .gte('created_at', today.toISOString()) as unknown as { data: FoodEntryWithFood[]; error: any };

    if (error) {
      console.error("Failed to fetch food entries:", error.message);
      return;
    }

    const totals = (data ?? []).reduce((acc, entry) => {
      if (!entry.foods) return acc;

      const factor = (entry.quantity ?? 0) / 100;
      acc.calories += (entry.foods.calories ?? 0) * factor;
      acc.protein  += (entry.foods.protein ?? 0) * factor;
      acc.carbs    += (entry.foods.carbs ?? 0) * factor;
      acc.fat      += (entry.foods.fat ?? 0) * factor;
      acc.vitaminC += (entry.foods.vitamin_c ?? 0) * factor;
      acc.iron     += (entry.foods.iron ?? 0) * factor;
      acc.magnesium+= (entry.foods.magnesium ?? 0) * factor;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, vitaminC: 0, iron: 0, magnesium: 0 });

    setNutrition(totals);
  })();
}, []);


  const pages = [
    { key: 'macros', component: <MacroView data={nutrition} /> },
    { key: 'vitamins', component: <VitaminView data={nutrition} /> },
    { key: 'minerals', component: <MineralView data={nutrition} /> },
  ];

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;
    const x = e.nativeEvent.contentOffset.x;
    setPageIndex(Math.round(x / pageWidth));
  };

  return (
    <>
      <View
        style={[styles.cardShadow, styles.container, { backgroundColor: ui.bg }]}
        onLayout={e => setPageWidth(e.nativeEvent.layout.width)}
      >
        <FlatList
          data={pages}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled={false}
          snapToInterval={pageWidth || undefined}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ref={flatListRef}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ width: pageWidth }}>
              {item.component}
            </View>
          )}
          style={{ borderRadius: 16, overflow: 'hidden' }}
        />

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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
  },
  cardShadow: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    overflow: 'hidden',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: '#888',
  },
});