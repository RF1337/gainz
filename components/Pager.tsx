import React, { useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

const PAGES = [
  { key: "1", title: "Side 1", bg: "#111827" },
  { key: "2", title: "Side 2", bg: "#0ea5e9" },
  { key: "3", title: "Side 3", bg: "#22c55e" },
];

export default function Pager() {
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={[styles.page, { backgroundColor: item.bg }]}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === index ? 1 : 0.3, transform: [{ scale: i === index ? 1.1 : 1 }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { width, height, alignItems: "center", justifyContent: "center" },
  title: { color: "white", fontSize: 28, fontWeight: "700" },
  dots: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 9999, backgroundColor: "white" },
});