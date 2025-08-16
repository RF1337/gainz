import ScreenWrapper from "@/components/ScreenWrapper";
import { useTranslation } from "@/hooks/useTranslation";
import { useHealthData } from "@/providers/HealthDataProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

  export default function StepsPage() {
    const { ui } = useTheme();
    const { t } = useTranslation();

    const {
        initialLoading,      // første HealthKit-load (blokker side)
        refreshing,          // foreground-opdatering (blød)
        steps,
    } = useHealthData();
    const [pageLoading, setPageLoading] = useState<boolean>(true);


    const isPageLoading = pageLoading || initialLoading;

    if (isPageLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ui.text} />
        </View>
      );
    }

    return (
      <ScreenWrapper>
        <Text style={styles.title}>{t('steps.title')}</Text>
        <Text style={styles.steps}>{steps}</Text>
      </ScreenWrapper>
    );
  }

  const styles = StyleSheet.create({
    title: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    steps: {
      fontSize: 18,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });