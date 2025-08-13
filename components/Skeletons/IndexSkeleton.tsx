// components/Skeletons/ExploreSkeleton.tsx
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreSkeleton() {
  const { scheme } = useThemeContext();
  const isDark = scheme === "dark";

  const colors = {
    background: isDark ? '#050505' : '#fff',
    contentBackground: isDark ? '#101010' : '#fff',
    contentForeground: isDark ? '#202020' : '#f2f2f2',
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* Search Bar */}
      <ContentLoader
        speed={1.5}
        width="100%"
        height={48}
        backgroundColor={colors.contentBackground}
        foregroundColor={colors.contentForeground}
      >
        <Rect x="0" y="0" rx="8" ry="8" width="100%" height="40" />
      </ContentLoader>

      {/* Categories */}
      <View style={{ flexDirection: "row", marginTop: 24 }}>
        {[...Array(5)].map((_, i) => (
          <ContentLoader
            key={i}
            speed={1.5}
            width={100}
            height={100}
            style={{ marginRight: 12 }}
            backgroundColor={colors.contentBackground}
            foregroundColor={colors.contentForeground}
          >
            <Circle cx="50" cy="40" r="20" />
            <Rect x="10" y="70" rx="6" ry="6" width="80" height="14" />
          </ContentLoader>
        ))}
      </View>

      {/* Trending Items */}
      <View style={{ marginTop: 32 }}>
        {[...Array(3)].map((_, i) => (
          <ContentLoader
            key={i}
            speed={1.5}
            width="100%"
            height={230}
            style={{ marginBottom: 24 }}
            backgroundColor={colors.contentBackground}
            foregroundColor={colors.contentForeground}
          >
            <Rect x="0" y="0" rx="12" ry="12" width="100%" height="180" />
            <Rect x="0" y="190" rx="6" ry="6" width="60%" height="16" />
            <Rect x="0" y="210" rx="6" ry="6" width="40%" height="14" />
          </ContentLoader>
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}