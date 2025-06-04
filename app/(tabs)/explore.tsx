// app/(tabs)/explore/index.tsx
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Category = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  key: string; // used for filtering
};

type TrendingItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUri: string;
  category: string; // e.g. "Recipes", "Workout Plans"
  route: string;
};

export default function ExploreScreen() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";
  const colors = {
    background: isDark ? "#000" : "#fff",
    card: isDark ? "#1e1e1e" : "#f2f2f2",
    text: isDark ? "#fff" : "#000",
    subText: isDark ? "#aaa" : "#555",
    accent: "#ff6b00",
    inputBg: isDark ? "#121212" : "#f2f2f2",
    placeholder: isDark ? "#666" : "#999",
  };

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    { label: "Meal Plans", icon: "nutrition-outline", key: "Meal Plans" },
    { label: "Recipes", icon: "restaurant-outline", key: "Recipes" },
    { label: "Workout Plans", icon: "barbell-outline", key: "Workout Plans" },
    { label: "Exercise Library", icon: "body-outline", key: "Exercise Library" },
    // Add more categories as needed
  ];

  const trending: TrendingItem[] = [
    {
      id: "1",
      title: "Keto Chicken Salad",
      subtitle: "High-Protein Recipe",
      imageUri: "https://via.placeholder.com/300x180",
      category: "Recipes",
      route: "/explore/recipes/keto-chicken-salad",
    },
    {
      id: "2",
      title: "Beginner Full Body",
      subtitle: "Starter Workout Plan",
      imageUri: "https://via.placeholder.com/300x180",
      category: "Workout Plans",
      route: "/explore/workout-plans/beginner-full-body",
    },
    {
      id: "3",
      title: "Low-Carb Meal Prep",
      subtitle: "Meal Plan for Weight Loss",
      imageUri: "https://via.placeholder.com/300x180",
      category: "Meal Plans",
      route: "/explore/meal-plans/low-carb-meal-prep",
    },
    {
      id: "4",
      title: "Push/Pull/Legs",
      subtitle: "Advanced Split Routine",
      imageUri: "https://via.placeholder.com/300x180",
      category: "Workout Plans",
      route: "/explore/workout-plans/push-pull-legs",
    },
    {
      id: "5",
      title: "Healthy Smoothie",
      subtitle: "Quick Breakfast Recipe",
      imageUri: "https://via.placeholder.com/300x180",
      category: "Recipes",
      route: "/explore/recipes/healthy-smoothie",
    },
    {
      id: "6",
      title: "Yoga for Flexibility",
      subtitle: "Exercise Library Highlight",
      imageUri: "https://via.placeholder.com/300x180",
      category: "Exercise Library",
      route: "/explore/exercise-library/yoga-for-flexibility",
    },
    // Add more items as needed
  ];

  // Filter trending items based on selectedCategory and searchQuery
  const filteredTrending = useMemo(() => {
    return trending.filter((item) => {
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
      const lowerTitle = item.title.toLowerCase();
      const lowerSubtitle = item.subtitle.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch =
        lowerTitle.includes(lowerQuery) || lowerSubtitle.includes(lowerQuery);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const renderCategory = ({ item }: { item: Category }) => {
    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          { backgroundColor: colors.card },
          selectedCategory === item.key && { backgroundColor: colors.accent },
        ]}
        onPress={() => setSelectedCategory(selectedCategory === item.key ? null : item.key)}
      >
        <Ionicons
          name={item.icon}
          size={28}
          color={selectedCategory === item.key ? "#fff" : colors.accent}
        />
        <Text
          style={[
            styles.categoryLabel,
            { color: selectedCategory === item.key ? "#fff" : colors.text },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTrendingItem = ({ item }: { item: TrendingItem }) => (
    <TouchableOpacity
      style={[styles.trendingCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(item.route)}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={styles.trendingImage}
        resizeMode="cover"
      />
      <View style={styles.trendingTextContainer}>
        <Text style={[styles.trendingTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.trendingSubtitle, { color: colors.subText }]}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg }]}>
        <Ionicons name="search-outline" size={20} color={colors.placeholder} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Categories Section */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>
          Categories
        </Text>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item) => item.key}
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Trending Section */}
        <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 24 }]}>
          Trending Now
        </Text>
        <FlatList
          data={filteredTrending}
          keyExtractor={(item) => item.id}
          renderItem={renderTrendingItem}
          scrollEnabled={false} // Let the parent ScrollView handle scrolling
          contentContainerStyle={styles.trendingList}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 40,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoriesList: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
  categoryCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  trendingList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  trendingCard: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  trendingImage: {
    width: "100%",
    height: 180,
  },
  trendingTextContainer: {
    padding: 12,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  trendingSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});  
