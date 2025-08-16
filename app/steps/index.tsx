// app/(stack)/steps/index.tsx
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import { getAllGoals } from '@/services/goalsService';
import { useTheme } from '@/theme/ThemeProvider';
import { Picker } from '@expo/ui/swift-ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { BarChart, PieChart } from 'react-native-gifted-charts';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppleHealthKit } = require('react-native').NativeModules;

type DaySample = {
  date: string;   // yyyy-MM-dd
  value: number;  // steps
};

const VIEW_DAY = 0;
const VIEW_WEEK = 1;
const VIEW_MONTH = 2;

const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const startOfWeekMonday = (d = new Date()) => {
  const x = new Date(d);
  const day = x.getDay();
  const diffToMonday = (day + 6) % 7;
  x.setDate(x.getDate() - diffToMonday);
  x.setHours(0, 0, 0, 0);
  return x;
};
const startOfMonth = (d = new Date()) => {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
};

// HealthKit fetcher
async function getDailySteps(from: Date, to: Date): Promise<DaySample[]> {
  if (!AppleHealthKit) return [];
  return new Promise((resolve) => {
    const opts = {
      startDate: from.toISOString(),
      endDate: to.toISOString(),
      ascending: true,
      unit: 'count'
    };

    const handler = (err: any, res: any[]) => {
      if (err || !Array.isArray(res)) {
        resolve([]);
        return;
      }
      const tmp: { date: string; value: number }[] = res.map((r: any) => {
        const iso = r.date ?? r.startDate ?? r.endDate;
        const d = iso ? new Date(iso) : new Date();
        return { date: toYMD(d), value: Math.max(0, Math.floor(r.value ?? 0)) };
      });
      const map = new Map<string, number>();
      for (const s of tmp) map.set(s.date, (map.get(s.date) ?? 0) + s.value);

      const out: DaySample[] = [];
      const cursor = new Date(from);
      const end = new Date(to);
      cursor.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      while (cursor <= end) {
        const key = toYMD(cursor);
        out.push({ date: key, value: map.get(key) ?? 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
      resolve(out);
    };

    if (AppleHealthKit.getDailyStepCountSamples) {
      AppleHealthKit.getDailyStepCountSamples(opts, handler);
    } else if (AppleHealthKit.getDailyStepCount) {
      AppleHealthKit.getDailyStepCount(opts, handler);
    } else {
      resolve([]);
    }
  });
}

export default function StepsScreen() {
  const { ui } = useTheme();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [dayTotal, setDayTotal] = useState<number>(0);
  const [weekSamples, setWeekSamples] = useState<DaySample[]>([]);
  const [monthSamples, setMonthSamples] = useState<DaySample[]>([]);
  const [goal, setGoal] = useState<number>(10000);

  // Goal from service
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

  const ranges = useMemo(() => {
    const now = new Date();
    return {
      [VIEW_DAY]: { from: startOfDay(now), to: endOfDay(now) },
      [VIEW_WEEK]: { from: startOfWeekMonday(now), to: now },
      [VIEW_MONTH]: { from: startOfMonth(now), to: now },
    } as const;
  }, []);

  const fetchCurrent = useCallback(async () => {
    if (!AppleHealthKit) return;
    AppleHealthKit.isAvailable(async (error: any, available: boolean) => {
      if (error || !available) {
        setDayTotal(0);
        setWeekSamples([]);
        setMonthSamples([]);
        return;
      }
      const { from, to } = ranges[selectedIndex];
      const data = await getDailySteps(from, to);
      if (selectedIndex === VIEW_DAY) {
        setDayTotal(data.reduce((sum, d) => sum + d.value, 0));
      } else if (selectedIndex === VIEW_WEEK) {
        setWeekSamples(data);
      } else if (selectedIndex === VIEW_MONTH) {
        setMonthSamples(data);
      }
    });
  }, [ranges, selectedIndex]);

  useEffect(() => { fetchCurrent(); }, [fetchCurrent]);

  useEffect(() => {
    const onChange = (st: AppStateStatus) => { if (st === 'active') fetchCurrent(); };
    const sub = AppState.addEventListener('change', onChange);
    return () => { sub.remove(); };
  }, [fetchCurrent]);

  const weekChartData = useMemo(() => {
    const dayLabel = (ymd: string) => {
      const [y, m, d] = ymd.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short' });
    };
    return weekSamples.map(s => ({
      value: s.value,
      label: dayLabel(s.date),
      frontColor: s.value >= goal ? '#2ecc71' : ui.primary,
      topLabelComponent: () => (
        <Text style={{ fontSize: 12, color: '#888' }}>
          {s.value > 0 ? s.value.toLocaleString() : ''}
        </Text>
      ),
    }));
  }, [weekSamples, goal]);

  const monthMarkedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const s of monthSamples) {
      if (s.value > 0) marks[s.date] = { marked: true };
    }
    const today = toYMD(new Date());
    marks[today] = { ...(marks[today] ?? {}), selected: true, selectedColor: '#3498db' };
    return marks;
  }, [monthSamples]);

  // ✅ FIX: percentByDate & colorFor now defined
  const percentByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of monthSamples) {
      const pct = goal > 0 ? s.value / goal : 0;
      map[s.date] = Math.min(Math.max(pct, 0), 1);
    }
    return map;
  }, [monthSamples, goal]);

  const colorFor = (p: number) => {
    if (p >= 1) return '#2e78ccff';
    if (p >= 0.75) return '#27ae60';
    if (p >= 0.5) return '#f1c40f';
    if (p > 0) return '#e67e22';
    return '#95a5a6';
  };

  const onSelectDate = (ds: string) => {
    console.log('Selected date', ds);
  };

  function StatRow({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color: string }) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
        <Text style={{ fontSize: 13, opacity: 0.6, color }}>{label}</Text>
        <Text style={{ fontSize: 20, fontWeight: '600', color, marginTop: 2 }}>
          {value}<Text style={{ fontSize: 14, opacity: 0.6 }}> {suffix}</Text>
        </Text>
        </View>
        <View>
        <Text style={{ fontSize: 13, opacity: 0.6, color }}>{label}</Text>
        <Text style={{ fontSize: 20, fontWeight: '600', color, marginTop: 2 }}>
          {value}<Text style={{ fontSize: 14, opacity: 0.6 }}> {suffix}</Text>
        </Text>
        </View>
        <View>
        <Text style={{ fontSize: 13, opacity: 0.6, color }}>{label}</Text>
        <Text style={{ fontSize: 20, fontWeight: '600', color, marginTop: 2 }}>
          {value}<Text style={{ fontSize: 14, opacity: 0.6 }}> {suffix}</Text>
        </Text>
        </View>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <Header leftIcon={<BackButton />} title="Steps" />
      <Picker
        options={['Day', 'Week', 'Month']}
        selectedIndex={selectedIndex}
        onOptionSelected={({ nativeEvent: { index } }) => setSelectedIndex(index)}
        variant="segmented"
      />

      {selectedIndex === VIEW_DAY && (
        <View style={{ flex: 1, paddingVertical: 16 }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <PieChart
              donut
              data={[
                { value: dayTotal, text: 'Steps', color: ui.primary },
                { value: Math.max(goal - dayTotal, 0), text: 'Remaining', color: ui.bg },
              ]}
              innerRadius={100}
              innerCircleColor={ui.bgDark}
              isAnimated
              animationDuration={500}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: '600', fontSize: 18, color: ui.text }}>
                    {dayTotal.toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 12, color: ui.textMuted }}>
                    out of {goal.toLocaleString()}
                  </Text>
                </View>
              )}
            />
          </View>
          <StatRow label="Total Steps" value={dayTotal.toLocaleString()} suffix="steps" color={ui.text} />
        </View>
      )}

      {selectedIndex === VIEW_WEEK && (
        <View style={{ flex: 1, paddingVertical: 16 }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <BarChart
              data={weekChartData}
              barWidth={26}
              spacing={18}
              roundedTop
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={0}
              frontColor={ui.primary}
              yAxisTextStyle={{ color: ui.textMuted }}
              xAxisLabelTextStyle={{ color: ui.textMuted }}
              hideRules
              initialSpacing={10}
              maxValue={Math.max(goal, ...weekSamples.map(s => s.value)) || goal}
              isAnimated
            />
          </View>
          <StatRow label="Total Steps" value={weekSamples.reduce((a, b) => a + b.value, 0).toLocaleString()} suffix="steps" color={ui.text} />
        </View>
      )}

      {selectedIndex === VIEW_MONTH && (
        <View style={{ flex: 1, paddingVertical: 16 }}>
          <Calendar
            markedDates={monthMarkedDates}
            theme={{
              calendarBackground: ui.bg,
              dayTextColor: ui.text,
              monthTextColor: ui.text,
              todayTextColor: '#3498db',
              selectedDayBackgroundColor: '#3498db',
              textDisabledColor: ui.textMuted,
            }}
            dayComponent={({ date, state }) => {
              const ds = date?.dateString ?? '';
              const pct = percentByDate[ds] ?? 0;
              const barColor = colorFor(pct);
              return (
                <Pressable onPress={() => onSelectDate(ds)} style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: state === 'disabled' ? ui.textMuted : ui.text,
                      opacity: state === 'disabled' ? 0.6 : 1,
                    }}
                  >
                    {date.day}
                  </Text>
                  <View
                    style={{
                      marginTop: 6,
                      width: 28,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${pct * 100}%`,
                        height: '100%',
                        backgroundColor: barColor,
                      }}
                    />
                  </View>
                </Pressable>
              );
            }}
          />
          <StatRow label="Total Steps" value={monthSamples.reduce((a, b) => a + b.value, 0).toLocaleString()} suffix="steps" color={ui.text} />
        </View>
      )}
    </ScreenWrapper>
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
