// components/Header.tsx
import { useTheme } from "@/theme/ThemeProvider";
import { StyleSheet, Text, View } from "react-native";

type HeaderProps = {
  leftIcon?: React.ReactNode;
  title: string;
  rightIcon?: React.ReactNode;
};

export default function Header({ title, leftIcon, rightIcon }: HeaderProps) {
  const { ui } = useTheme();

  return (
    <View style={[styles.container]}>
      <View style={styles.left}>
        {leftIcon}
      </View>

      <Text style={[styles.title, { color: ui.text }]}>{title}</Text>

      <View style={styles.right}>
        {rightIcon}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    alignItems: "center",
    flex: 1,
  },
  right: {
    alignItems: "flex-end",
  },
});