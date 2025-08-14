import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function DetailsRedirect() {
  const { foodId } = useLocalSearchParams();

  useEffect(() => {
    if (foodId) {
      // If the foodId exists, go to the dynamic route
      router.replace(`/scanner/details/${foodId}`);
    } else {
      // If no foodId is provided, just go back or handle it
      router.back();
    }
  }, [foodId]);

  // Show a tiny loading spinner while redirecting
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="small" />
    </View>
  );
}