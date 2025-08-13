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

export default function NutritionWidget() {
  const { ui } = useTheme();
  const [pageWidth, setPageWidth] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const [nutrition, setNutrition] = useState({
    calories: 0, protein: 0, carbs: 0, fat: 0, vitaminC: 0, iron: 0, magnesium: 0,
  });

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id;
      if (!user_id) return;

      const today = new Date(); today.setHours(0,0,0,0);
      const { data, error } = await supabase
        .from('food_entries')
        .select('calories, protein, carbs, fat, vitamin_c, iron, magnesium')
        .eq('user_id', user_id)
        .gte('created_at', today.toISOString());

      if (error) { console.error(error.message); return; }

      const totals = (data ?? []).reduce((acc, it) => ({
        calories: acc.calories + (it.calories ?? 0),
        protein:  acc.protein  + (it.protein  ?? 0),
        carbs:    acc.carbs    + (it.carbs    ?? 0),
        fat:      acc.fat      + (it.fat      ?? 0),
        vitaminC: acc.vitaminC + (it.vitamin_c ?? 0),
        iron:     acc.iron     + (it.iron ?? 0),
        magnesium:acc.magnesium+ (it.magnesium ?? 0),
      }), { calories:0, protein:0, carbs:0, fat:0, vitaminC:0, iron:0, magnesium:0 });

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
      {/* Card wrapper (gives bg, radius, shadow) */}
      <View
        style={[styles.cardShadow, styles.container, { backgroundColor: ui.bg }]}
        onLayout={e => setPageWidth(e.nativeEvent.layout.width)} // ← measure inner width
      >
        <FlatList
          data={pages}
          keyExtractor={(item) => item.key}
          horizontal
          // pagingEnabled works too, but snapToInterval is more precise with measured widths
          pagingEnabled={false}
          snapToInterval={pageWidth || undefined}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ref={flatListRef}
          // Put padding inside the scrolling content (NOT on style)
          contentContainerStyle={{ padding: 16 }}
          // Each page fills the viewport width
          renderItem={({ item }) => (
            <View style={{ width: pageWidth }}>
              {item.component}
            </View>
          )}
          // DO NOT put padding on `style` here, it shrinks the viewport!
          style={{ borderRadius: 16, overflow: 'hidden' }}
        />
      </View>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {pages.map((_, i) => (
          <View key={i} style={[styles.dot, { opacity: i === pageIndex ? 1 : 0.3 }]} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container:{
    height: 250,
  },
  cardShadow: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
    overflow: 'hidden', // clip children to rounded corners
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4, marginHorizontal: 6, backgroundColor: '#888',
  },
});