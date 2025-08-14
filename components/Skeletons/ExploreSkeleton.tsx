// components/Skeletons/ExploreSkeleton.tsx
import { useTheme } from "@/theme/ThemeProvider";
import React from "react";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { View } from "react-native";
import ScreenWrapper from "../ScreenWrapper";

export default function ExploreSkeleton() {
  const { ui } = useTheme();

  return (

<ScreenWrapper>
      {/* Search Bar */}
      <ContentLoader
        speed={1.5}
        width="100%"
        height={48}
        backgroundColor={ui.bg}
        foregroundColor={ui.text}
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
            backgroundColor={ui.bg}
            foregroundColor={ui.text}
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
            backgroundColor={ui.bg}
            foregroundColor={ui.text}
          >
            <Rect x="0" y="0" rx="12" ry="12" width="100%" height="180" />
            <Rect x="0" y="190" rx="6" ry="6" width="60%" height="16" />
            <Rect x="0" y="210" rx="6" ry="6" width="40%" height="14" />
          </ContentLoader>
        ))}
      </View>
    </ScreenWrapper>
  );
}