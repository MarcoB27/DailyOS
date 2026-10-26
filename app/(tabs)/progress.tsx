// app/(tabs)/progress.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CheckCircle2, Clock, Trophy, Award } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useWeeklyProgress } from '../../src/features/progress/useProgressQueries';
import { WeeklyBarChart } from '../../src/components/ui/WeeklyBarChart';

export default function ProgressScreen() {
  const { data: weeklyData, isLoading } = useWeeklyProgress();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const daysData = weeklyData?.days || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Riepilogo Settimanale</Text>
      <Text style={styles.subtitle}>Analisi delle tue prestazioni negli ultimi 7 giorni</Text>

      {/* CARD METRICHE SINTETICHE */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={20} color={theme.colors.success} />
          </View>
          <Text style={styles.metricValue}>{weeklyData?.totalTasksCompleted || 0}</Text>
          <Text style={styles.metricLabel}>Attività completate</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.iconCircle}>
            <Clock size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.metricValue}>{weeklyData?.totalFocusMinutes || 0}m</Text>
          <Text style={styles.metricLabel}>Minuti di Focus</Text>
        </View>
      </View>

      {/* BANNER GIORNO PIÙ PRODUTTIVO */}
      <View style={styles.bannerCard}>
        <Trophy size={24} color={theme.colors.warning} />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Giorno più produttivo</Text>
          <Text style={styles.bannerSubtitle}>
            {weeklyData?.mostProductiveDay !== 'N/D'
              ? `${weeklyData?.mostProductiveDay} è stato il tuo giorno migliore!`
              : 'Completa alcune attività per identificare il tuo giorno migliore.'}
          </Text>
        </View>
      </View>

      {/* GRAFICO ATTIVITÀ PER GIORNO */}
      <View style={styles.sectionHeader}>
        <Award size={18} color={theme.colors.textMuted} />
        <Text style={styles.sectionTitle}>Attività completate per giorno</Text>
      </View>
      <WeeklyBarChart data={daysData} metricKey="tasksCompleted" unitLabel="attività" />

      {/* GRAFICO MINUTI FOCUS PER GIORNO */}
      <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
        <Clock size={18} color={theme.colors.textMuted} />
        <Text style={styles.sectionTitle}>Minuti di Focus per giorno</Text>
      </View>
      <WeeklyBarChart data={daysData} metricKey="focusMinutes" unitLabel="minuti" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: theme.colors.warning,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bannerSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});