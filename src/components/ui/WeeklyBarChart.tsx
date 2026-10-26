import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { DayStat } from '../../services/progress-service';

interface WeeklyBarChartProps {
  data: DayStat[];
  metricKey: 'tasksCompleted' | 'focusMinutes';
  unitLabel: string;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  data,
  metricKey,
  unitLabel,
}) => {
  const values = data.map((d) => d[metricKey]);
  const maxValue = Math.max(...values, 1); // Evita la divisione per zero se tutti i valori sono 0

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        {data.map((item, index) => {
          const val = item[metricKey];
          const heightPercent = Math.round((val / maxValue) * 100);
          const isHighest = val === maxValue && val > 0;

          return (
            <View key={index} style={styles.column}>
              <Text style={styles.barValue}>{val > 0 ? val : ''}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { height: `${Math.max(heightPercent, 4)}%` },
                    isHighest && styles.fillHighest,
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isHighest && styles.dayLabelHighest]}>
                {item.dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.unitFooter}>Unità: {unitLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  track: {
    width: 14,
    height: 110,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
    borderRadius: theme.borderRadius.full,
  },
  fillHighest: {
    backgroundColor: theme.colors.primary,
  },
  dayLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  dayLabelHighest: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  unitFooter: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
});