// app/(tabs)/today.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Settings, Plus, Flame, CheckCircle2, Check } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { getGreeting, getFormattedToday } from '../../src/utils/date-utils';
import { Task, Habit } from '../../src/types';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { TaskItem } from '../../src/components/domain/TaskItem';

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Ripassare architettura calcolatori',
    category: 'Studio',
    priority: 'Alta',
    scheduledTime: '10:00',
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Allenamento Full Body',
    category: 'Allenamento',
    priority: 'Media',
    scheduledTime: '18:00',
    isCompleted: true,
  },
  {
    id: '3',
    title: 'Spesa settimanale',
    category: 'Commissioni',
    priority: 'Bassa',
    isCompleted: false,
  },
];

const MOCK_HABITS: Habit[] = [
  { id: '1', title: 'Bere 2L di acqua', icon: 'droplet', color: '#3B82F6', isCompletedToday: true, streakCount: 5 },
  { id: '2', title: 'Leggere 20 pagine', icon: 'book', color: '#8B5CF6', isCompletedToday: false, streakCount: 3 },
];

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, isCompletedToday: !h.isCompletedToday } : h
      )
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.dateText}>{getFormattedToday()}</Text>
        </View>
        <Pressable style={styles.iconButton}>
          <Settings size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      {/* RIEPILOGO GIORNALIERO CARD */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Progresso Giornaliero</Text>
          <Text style={styles.summaryPercent}>{progressPercentage}%</Text>
        </View>
        <ProgressBar progress={progressPercentage} />
        <View style={styles.summaryFooter}>
          <Text style={styles.summarySubtext}>
            {completedCount} di {totalCount} attività completate
          </Text>
        </View>
      </View>

      {/* BANNER GIORNATA CONCLUSA (Se tutto completato) */}
      {isAllCompleted && (
        <View style={styles.completedBanner}>
          <CheckCircle2 size={24} color={theme.colors.success} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Text style={styles.bannerTitle}>Ottimo lavoro!</Text>
            <Text style={styles.bannerSubtitle}>Hai completato tutte le attività previste per oggi.</Text>
          </View>
        </View>
      )}

      {/* SEZIONE ATTIVITÀ DI OGGI */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>La mia giornata</Text>
        <Pressable style={styles.quickAddButton}>
          <Plus size={16} color={theme.colors.primary} />
          <Text style={styles.quickAddText}>Aggiungi</Text>
        </Pressable>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nessuna attività programmata per oggi.</Text>
        </View>
      ) : (
        tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggleComplete={toggleTask} />
        ))
      )}

      {/* SEZIONE ABITUDINI */}
      <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
        <Text style={styles.sectionTitle}>Abitudini di oggi</Text>
      </View>

      <View style={styles.habitsRow}>
        {habits.map((habit) => (
          <Pressable
            key={habit.id}
            style={[
              styles.habitCard,
              habit.isCompletedToday && styles.habitCardCompleted,
            ]}
            onPress={() => toggleHabit(habit.id)}
          >
            <View style={styles.habitTop}>
              <Flame size={16} color={theme.colors.warning} />
              <Text style={styles.streakText}>{habit.streakCount} gg</Text>
            </View>
            <Text style={[styles.habitTitle, habit.isCompletedToday && styles.habitTitleCompleted]}>
              {habit.title}
            </Text>
            <View
              style={[
                styles.habitCheck,
                habit.isCompletedToday && styles.habitCheckCompleted,
              ]}
            >
              {habit.isCompletedToday && <Check size={12} color="#FFF" strokeWidth={3} />}
            </View>
          </Pressable>
        ))}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  iconButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  summaryPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  summaryFooter: {
    marginTop: theme.spacing.sm,
  },
  summarySubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  bannerTitle: {
    color: theme.colors.success,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bannerSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickAddText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
  },
  habitsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  habitCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  habitCardCompleted: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  habitTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginVertical: theme.spacing.xs,
  },
  habitTitleCompleted: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  habitCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.colors.textMuted,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCheckCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});