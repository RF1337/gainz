import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

export function usePedometer() {
  const [steps, setSteps] = useState<number>(0);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let sub: any;

    Pedometer.isAvailableAsync()
      .then(avail => setAvailable(avail))
      .catch(() => setAvailable(false));

    sub = Pedometer.watchStepCount(r => setSteps(r.steps));

    return () => sub && sub.remove();
  }, []);

  return { steps, available };
}