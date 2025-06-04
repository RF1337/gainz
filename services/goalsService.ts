import AsyncStorage from '@react-native-async-storage/async-storage';

export type GoalKey = 'stepGoal' | 'waterGoal' | 'calorieGoal' | 'weightGoal' | 'sleepGoal' | 'exerciseGoal';

export async function setGoal(key: GoalKey, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

export async function getGoal(key: GoalKey): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return null;
  }
}

// Optional: Fetch all goals
export async function getAllGoals() {
  const keys: GoalKey[] = ['stepGoal', 'waterGoal', 'calorieGoal', 'weightGoal', 'sleepGoal', 'exerciseGoal'];
  const values = await Promise.all(keys.map(getGoal));
  return keys.reduce((acc, key, index) => {
    acc[key] = values[index];
    return acc;
  }, {} as Record<GoalKey, string | null>);
}