// app/item/[id].tsx
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text } from "react-native";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchItem() {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error(error.message);
      else setItem(data);
    }

    fetchItem();
  }, [id]);

  if (!item) return <Text>Loading...</Text>;

  return (
    <ScreenWrapper>
        <Header
            leftIcon={<BackButton />}
            title={item.title}
        />

        <Image source={{ uri: item.image_uri }} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.content}>{item.content || "No details available."}</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  image: { width: "100%", height: 200, borderRadius: 12 },
  title: { fontSize: 24, fontWeight: "700", marginTop: 20 },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8 },
  content: { fontSize: 16, marginTop: 16 },
});