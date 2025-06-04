import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleDone = async () => {
    router.push('/onboarding/goal');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24 }}>Velkommen til Gainz 💪</Text>
      <Button title="Kom i gang" onPress={handleDone} />
    </View>
  );
}