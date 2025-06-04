import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type Scheme = 'light' | 'dark';
const STORAGE_KEY = 'colorSchemeOverride';

let listeners: (() => void)[] = [];

export function useColorScheme(): Scheme {
  const system = useSystemColorScheme() ?? 'light';
  const [override, setOverride] = useState<Scheme | null>(null);
  const [internalKey, setInternalKey] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'dark') setOverride(val);
    });

    const update = () => setInternalKey((k) => k + 1);
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  return override ?? system;
}

export async function setColorSchemeOverride(scheme: Scheme) {
  await AsyncStorage.setItem(STORAGE_KEY, scheme);
  listeners.forEach((fn) => fn());
}

export async function getColorSchemeOverride(): Promise<Scheme | null> {
  const val = await AsyncStorage.getItem(STORAGE_KEY);
  return val === 'light' || val === 'dark' ? val : null;
}