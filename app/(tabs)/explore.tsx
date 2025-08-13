// app/(tabs)/explore/index.tsx

import ScreenWrapper from "@/components/ScreenWrapper";
import { ExploreSkeleton } from "@/components/Skeletons";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { default as React, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Category = {
  id: number;
  label: string;
  icon_name: string;
  key: string;
};

type ItemRow = {
  id: string;
  title: string;
  subtitle: string;
  image_uri: string;
  categories_key: string;
  route: string;
  is_trending: boolean;
};

export default function ExploreScreen() {
  const { ui } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      setLoadingCats(true);
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, label, icon_name, key")
          .order("label", { ascending: true });

        if (error) {
          console.error("Error loading categories:", error.message);
          setCategories([]);
        } else {
          setCategories(data || []);
        }
      } catch (err: any) {
        console.error("Exception in loadCategories:", err.message);
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadItems() {
      setLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from("items")
          .select(
            `id, title, subtitle, image_uri, route, is_trending, categories (key)`
          )
          .eq("is_trending", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading items:", error.message);
          setItems([]);
        } else if (data) {
          const transformed: ItemRow[] = (data as any[]).map((row) => ({
            id: row.id,
            title: row.title,
            subtitle: row.subtitle,
            image_uri: row.image_uri,
            categories_key: row.categories?.key ?? "",
            route: row.route,
            is_trending: row.is_trending,
          }));
          setItems(transformed);
        } else {
          setItems([]);
        }
      } catch (err: any) {
        console.error("Exception in loadItems:", err.message);
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    }
    loadItems();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const inCategory = selectedCategory
        ? it.categories_key === selectedCategory
        : true;
      const titleLower = it.title.toLowerCase();
      const subLower = it.subtitle.toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      return inCategory && (titleLower.includes(queryLower) || subLower.includes(queryLower));
    });
  }, [items, selectedCategory, searchQuery]);

  if (loadingCats || loadingItems) return <ExploreSkeleton />;
  const renderCategory = ({ item }: { item: Category }) => {
  const isSelected = selectedCategory === item.key;

  return (
    <View style={{ flexDirection: "column", alignItems: "center" }}>
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() =>
          setSelectedCategory(isSelected ? null : item.key)
        }
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={item.icon_name as any}
          size={24}
          color={isSelected ? ui.text : ui.textMuted}
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.categoryLabel,
          { color: isSelected ? ui.text : ui.textMuted },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>

      {/* Underline only when selected */}
      {isSelected && (
        <View
          style={[
            styles.categoryUnderline,
            { backgroundColor: ui.text },
          ]}
        />
      )}
    </View>
  );
};


  const renderItem = ({ item }: { item: ItemRow }) => (
    <TouchableOpacity
      style={[styles.trendingCard, { backgroundColor: ui.bg }, styles.cardShadow]}
      onPress={() => router.push(`/explore-item/${item.id}` as any)}
    >
      <Image
        source={{ uri: item.image_uri }}
        style={styles.trendingImage}
        resizeMode="cover"
      />
      <View style={[styles.trendingInfo]}>
        <Text style={[styles.trendingTitle, { color: ui.text }]}> {item.title} </Text>
        <Text style={[styles.trendingSubtitle, { color: ui.textMuted }]}> {item.subtitle} </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={[styles.searchContainer, styles.cardShadow, { backgroundColor: ui.bg }]}>
        <Ionicons name="search-outline" size={20} color={ui.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: ui.text }]}
          placeholder="Search..."
          placeholderTextColor={ui.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(cat) => cat.key}
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/*
        <Text style={[styles.sectionHeader, { color: ui.text, marginTop: 16 }]}>Trending Now</Text>
        */}
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          scrollEnabled={false}
          contentContainerStyle={[styles.trendingList, styles.cardShadow]}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, height: 40 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoriesList: { flex: 1, paddingVertical: 8, gap: 24 },
  categoryCard: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  trendingList: { paddingTop: 8 },
  trendingCard: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  trendingImage: { width: "100%", height: 180 },
  trendingInfo: {
    padding: 12,
  },
  trendingTitle: { fontSize: 18, fontWeight: "600" },
  trendingSubtitle: { fontSize: 14, marginTop: 4 },
  cardShadow: {
    shadowColor: "hsla(0, 0%, 80%, 1.00)",  
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    elevation: 2,
  },
  categoryUnderline: {
  height: 2,
  borderRadius: 1,
  marginTop: 6,
  alignSelf: "stretch",
}
});