// providers/HealthDataProvider.tsx
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';

// Hvis du har typer for modulet, kan du erstatte any.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppleHealthKit } = require('react-native').NativeModules;

type HealthData = {
  initialized: boolean;
  initialLoading: boolean; // første fetch (kan gate hele siden)
  refreshing: boolean;     // “blød” opdatering ved foreground
  steps: number;
  distanceMeters: number;
  activeKcal: number;
  basalKcal: number;
  totalKcal: number;
  exerciseMinutes: number;
  sleepMinutes24h: number;
  bmi: number | null;
};

type HealthDataContextValue = HealthData & {
  refresh: () => void;
};

const HealthDataContext = createContext<HealthDataContextValue | null>(null);

const initialState: HealthData = {
  initialized: false,
  initialLoading: true,
  refreshing: false,
  steps: 0,
  distanceMeters: 0,
  activeKcal: 0,
  basalKcal: 0,
  totalKcal: 0,
  exerciseMinutes: 0,
  sleepMinutes24h: 0,
  bmi: null,
};

const permissions = {
  permissions: {
    read: [
      'Steps',
      'StepCount',
      'BodyMassIndex',
      'Height',
      'Weight',
      'DistanceWalkingRunning',
      'ActiveEnergyBurned',
      'BasalEnergyBurned',
      'AppleExerciseTime',
      'SleepAnalysis',
    ],
    write: [],
  },
};

function ranges() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return {
    nowISO: now.toISOString(),
    startOfDayISO: startOfDay.toISOString(),
    dayAgoISO: dayAgo.toISOString(),
  };
}

// ---- Promise-wrappers (kører i parallel i refresh) ----
function getSteps(): Promise<number> {
  return new Promise((resolve) => {
    const { startOfDayISO, nowISO } = ranges();
    AppleHealthKit.getStepCount(
      { startDate: startOfDayISO, endDate: nowISO },
      (err: any, res: any) => resolve(err ? 0 : (res?.value || 0))
    );
  });
}

function getDistance(): Promise<number> {
  return new Promise((resolve) => {
    const { startOfDayISO, nowISO } = ranges();
    AppleHealthKit.getDistanceWalkingRunning(
      { startDate: startOfDayISO, endDate: nowISO },
      (err: any, res: any) => resolve(err ? 0 : (res?.value || 0)) // meters
    );
  });
}

function getActiveEnergy(): Promise<number> {
  return new Promise((resolve) => {
    const { startOfDayISO, nowISO } = ranges();
    AppleHealthKit.getActiveEnergyBurned(
      { startDate: startOfDayISO, endDate: nowISO, unit: 'kcal' },
      (err: any, res: any) => resolve(err ? 0 : (res?.value || 0))
    );
  });
}

function getBasalEnergy(): Promise<number> {
  return new Promise((resolve) => {
    const { startOfDayISO, nowISO } = ranges();
    AppleHealthKit.getBasalEnergyBurned(
      { startDate: startOfDayISO, endDate: nowISO, unit: 'kcal' },
      (err: any, res: any) => resolve(err ? 0 : (res?.value || 0))
    );
  });
}

function getExerciseMinutes(): Promise<number> {
  return new Promise((resolve) => {
    const { startOfDayISO, nowISO } = ranges();
    AppleHealthKit.getAppleExerciseTime(
      { startDate: startOfDayISO, endDate: nowISO },
      (err: any, res: any) => resolve(err ? 0 : Math.round(res?.value || 0))
    );
  });
}

function getLatestBmi(): Promise<number | null> {
  return new Promise((resolve) => {
    AppleHealthKit.getLatestBmi({}, (err: any, res: any) =>
      resolve(err ? null : (res?.value ?? null))
    );
  });
}

function getSleepMinutesLast24h(): Promise<number> {
  return new Promise((resolve) => {
    const { dayAgoISO, nowISO } = ranges();
    AppleHealthKit.getSleepSamples(
      { startDate: dayAgoISO, endDate: nowISO },
      (err: any, samples: any[]) => {
        if (err || !Array.isArray(samples)) return resolve(0);
        let minutes = 0;
        for (const s of samples) {
          const val = String(s?.value || '');
          if (!val.startsWith('ASLEEP')) continue; // kun søvn, ikke INBED
          const start = new Date(s.startDate).getTime();
          const end = new Date(s.endDate).getTime();
          if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
            minutes += Math.round((end - start) / 60000);
          }
        }
        resolve(minutes);
      }
    );
  });
}

// ---- Provider ----
export function HealthDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HealthData>(initialState);
  const didInit = useRef(false);

  const refresh = useCallback(async () => {
    // må kun køre når vi faktisk har init'et
    if (!state.initialized || !AppleHealthKit) return;

    const isFirst = state.initialLoading;

    // Første gang: behold initialLoading=true; andre gange sæt refreshing=true
    setState((s) => ({
      ...s,
      initialLoading: s.initialLoading,
      refreshing: !isFirst,
    }));

    const [
      steps,
      distanceMeters,
      activeKcalRaw,
      basalKcal,
      exerciseMinutes,
      bmi,
      sleepMinutes24h,
    ] = await Promise.all([
      getSteps(),
      getDistance(),
      getActiveEnergy(),
      getBasalEnergy(),
      getExerciseMinutes(),
      getLatestBmi(),
      getSleepMinutesLast24h(),
    ]);

    // fallback for active kcal hvis Watch ikke skriver
    const activeKcal = activeKcalRaw > 0 ? activeKcalRaw : Math.round(steps * 0.04);
    const totalKcal = activeKcal + basalKcal;

    setState((s) => ({
      ...s,
      steps,
      distanceMeters,
      activeKcal,
      basalKcal,
      totalKcal,
      exerciseMinutes,
      bmi,
      sleepMinutes24h,
      initialLoading: false,
      refreshing: false,
    }));
  }, [state.initialized, state.initialLoading]);

  const initialize = useCallback(() => {
    if (!AppleHealthKit) {
      Alert.alert('Error', 'HealthKit not available');
      setState((s) => ({ ...s, initialized: false, initialLoading: false }));
      return;
    }

    AppleHealthKit.isAvailable((error: any, available: boolean) => {
      if (error || !available) {
        Alert.alert('Error', 'HealthKit not available on this device');
        setState((s) => ({ ...s, initialized: false, initialLoading: false }));
        return;
      }

      AppleHealthKit.initHealthKit(permissions, (err: any) => {
        if (err) {
          console.log('HealthKit init error:', err);
          setState((s) => ({ ...s, initialized: false, initialLoading: false }));
          return;
        }
        // Sæt initialized — men KALD IKKE refresh() her
        setState((s) => ({ ...s, initialized: true }));
      });
    });
  }, []);

  // Init én gang ved mount
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      initialize();
    }
  }, [initialize]);

  // Kør første refresh når initialized bliver true (løsning A)
  useEffect(() => {
    if (state.initialized && state.initialLoading) {
      refresh();
    }
  }, [state.initialized, state.initialLoading, refresh]);

  // Refresh ved foreground (blød opdatering)
  useEffect(() => {
    const onChange = (st: AppStateStatus) => {
      if (st === 'active' && state.initialized) refresh();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [state.initialized, refresh]);

  const value = useMemo<HealthDataContextValue>(() => ({ ...state, refresh }), [state, refresh]);

  return <HealthDataContext.Provider value={value}>{children}</HealthDataContext.Provider>;
}

// ---- Hook ----
export function useHealthData() {
  const ctx = useContext(HealthDataContext);
  if (!ctx) throw new Error('useHealthData must be used within a HealthDataProvider');
  return ctx;
}