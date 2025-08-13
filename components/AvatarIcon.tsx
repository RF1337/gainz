import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import ContentLoader, { Circle } from "react-content-loader/native";
import { Image, Pressable, StyleSheet, View } from "react-native";

type AvatarIconProps = {
  size?: number; // optional size prop
};

export default function AvatarIcon({ size = 40 }: AvatarIconProps) {
  const { ui } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAvatarFromProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return setLoading(false);

        const { data: profileData, error: profileError, status } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (profileError && status !== 406) {
          console.error("Error fetching avatar:", profileError.message);
          return;
        }

        if (profileData?.avatar_url) {
          const { data } = supabase
            .storage
            .from("user-avatars")
            .getPublicUrl(profileData.avatar_url);
          setAvatarUrl(data.publicUrl);
        }
      } catch (err) {
        console.error("Unexpected avatar load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAvatarFromProfile();
  }, []);

  const dynamicStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (loading) {
    return (
      <Pressable onPress={() => router.push("/profile")}>
        <ContentLoader
          speed={1.5}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          backgroundColor={ui.skeletonBackground}
          foregroundColor={ui.skeletonForeground}
        >
          <Circle cx={size / 2} cy={size / 2} r={size / 2} />
        </ContentLoader>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={() => router.push("/profile")}>
      <View style={[styles.avatar, dynamicStyle, { backgroundColor: ui.border }]}>
        {avatarUrl && (
          <Image
            source={{ uri: avatarUrl }}
            style={[StyleSheet.absoluteFillObject, dynamicStyle]}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    overflow: "hidden",
  },
});