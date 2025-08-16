// app/(stack)/steps/index.tsx
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import { getAllGoals } from '@/services/goalsService';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    AppState,
    AppStateStatus,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppleHealthKit } = require('react-native').NativeModules;

type DaySample = {
  date: string;   // yyyy-MM-dd
  value: number;  // steps
};

export default function StepsScreen() {
  const { ui } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [samples, setSamples] = useState<DaySample[]>([]);
  const [goal, setGoal] = useState<number>(10000);

  // load step goal from your goals service
  useEffect(() => {
    let canceled = false;
    (async () => {
      const goals = await getAllGoals();
      if (canceled) return;
      const parsed = parseFloat((goals.stepGoal as string) ?? '10000');
      setGoal(Number.isFinite(parsed) ? parsed : 10000);
    })();
    return () => { canceled = true; };
  }, []);

  const getLastNDaysRange = (n: number) => {
    const end = new Date(); // now
    const start = new Date();
    start.setDate(end.getDate() - (n - 1));
    // HealthKit expects ISO strings
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
    const endDate = end.toISOString();
    return { startDate, endDate };
  };

  // Promise wrapper for daily samples
  const getDailyStepCountSamples = async (days: number): Promise<DaySample[]> => {
    if (!AppleHealthKit) return [];
    const { startDate, endDate } = getLastNDaysRange(days);

    // Some bridges use `getDailyStepCountSamples`, others `getDailyStepCount` — this tries the common one.
    return new Promise((resolve) => {
      const opts = { startDate, endDate, ascending: true, unit: 'count' };

      const handler = (err: any, res: any[]) => {
        if (err || !Array.isArray(res)) return resolve([]);
        // Normalise to {date:'yyyy-MM-dd', value:number}
        const normalized: DaySample[] = res.map((r: any) => {
          // common shapes: {startDate, endDate, value} or {date, value}
          const iso = r.date ?? r.startDate ?? r.endDate;
          const d = iso ? new Date(iso) : new Date();
          // yyyy-MM-dd for label keys
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const da = String(d.getDate()).padStart(2, '0');
          return { date: `${y}-${m}-${da}`, value: Math.max(0, Math.floor(r.value ?? 0)) };
        });

        // Some HK bridges return multiple entries per day; squash by date
        const map = new Map<string, number>();
        for (const s of normalized) {
          map.set(s.date, (map.get(s.date) ?? 0) + s.value);
        }

        // Ensure we have exactly N days, including days with 0
        const result: DaySample[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const da = String(d.getDate()).padStart(2, '0');
          const key = `${y}-${m}-${da}`;
          result.push({ date: key, value: map.get(key) ?? 0 });
        }

        resolve(result);
      };

      if (AppleHealthKit.getDailyStepCountSamples) {
        AppleHealthKit.getDailyStepCountSamples(opts, handler);
      } else if (AppleHealthKit.getDailyStepCount) {
        AppleHealthKit.getDailyStepCount(opts, handler);
      } else {
        // Fallback: use getStepCount per-day in a loop (slower). Kept minimal here.
        resolve([]);
      }
    });
  };

  const fetchData = useCallback(async () => {
    if (!AppleHealthKit) return;
    setRefreshing(true);

    // Make sure device supports HealthKit
    AppleHealthKit.isAvailable(async (error: any, available: boolean) => {
      if (error || !available) {
        setSamples([]);
        setRefreshing(false);
        return;
      }

      // We assume you already requested permissions via your provider on app startup.
      // Just read the last 7 days here.
      const s = await getDailyStepCountSamples(7);
      setSamples(s);
      setRefreshing(false);
    });
  }, []);

  // initial + foreground refresh
  const appStateSub = useRef<{ remove: () => void } | null>(null);
  useEffect(() => {
    fetchData();
    const onChange = (st: AppStateStatus) => { if (st === 'active') fetchData(); };
    // RN >= 0.65
    // @ts-ignore
    appStateSub.current = (AppState as any).addEventListener('change', onChange);
    return () => { appStateSub.current?.remove?.(); };
  }, [fetchData]);

  // Build chart data
  const chartData = useMemo(() => {
    // Label like "Mon", "Tue" … in locale
    const dayLabel = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { weekday: 'short' }); // e.g., "Mon"
    };

    return samples.map(s => ({
      value: s.value,
      label: dayLabel(s.date),
      frontColor: s.value >= goal ? '#2ecc71' : '#3498db',
      topLabelComponent: () => (
        <Text style={{ fontSize: 12, color: '#888' }}>
          {s.value > 0 ? s.value.toLocaleString() : ''}
        </Text>
      ),
    }));
  }, [samples, goal]);

  const weeklyTotal = useMemo(
    () => samples.reduce((acc, s) => acc + s.value, 0),
    [samples]
  );

  return (
    <ScreenWrapper>
      <Header 
      leftIcon={<BackButton />}
      title="Steps" />
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: ui.text }]}>Steps (7 days)</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="flag-outline" size={18} color={ui.textMuted} />
          <Text style={{ color: ui.textMuted, marginLeft: 6 }}>{goal.toLocaleString()} goal</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: ui.bg }]}>
        <BarChart
          data={chartData}
          barWidth={26}
          spacing={18}
          roundedTop
          roundedBottom
          noOfSections={4}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: ui.textMuted }}
          xAxisLabelTextStyle={{ color: ui.textMuted }}
          hideRules
          initialSpacing={10}
          frontColor={'#3498db'}
          maxValue={Math.max(goal, ...samples.map(s => s.value)) || goal}
          isAnimated
        />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: '#3498db' }]} />
            <Text style={{ color: ui.textMuted }}>Below goal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: '#2ecc71' }]} />
            <Text style={{ color: ui.textMuted }}>Met goal</Text>
          </View>
        </View>
      </View>

      <View style={[styles.statsRow, { borderColor: ui.bgDark }]}>
        <Stat label="This week" value={weeklyTotal.toLocaleString()} suffix=" steps" color={ui.text} />
        <Stat
          label="Avg/day"
          value={samples.length ? Math.round(weeklyTotal / samples.length).toLocaleString() : '0'}
          suffix=" steps"
          color={ui.text}
        />
      </View>
    </ScreenWrapper>
  );
}

function Stat({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, opacity: 0.6, color }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '700', color, marginTop: 2 }}>
        {value}<Text style={{ fontSize: 14, opacity: 0.6 }}> {suffix}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  card: { paddingVertical: 12, borderRadius: 16 },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 8, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});