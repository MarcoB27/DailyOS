// app/(tabs)/today.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Settings, Plus, Flame, CheckCircle2, Check } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { getGreeting, getFormattedToday } from '../../src/utils/date-utils';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { TaskItem } from '../../src/components/domain/TaskItem';
import { TaskFormModal } from '../../src/components/domain/TaskFormModal';
import { TaskFormValues } from '../../src/features/tasks/task-schema';
import { useTasks, useCreateTask, useToggleTask } from '../../src/features/tasks/useTaskQueries';
import { useHabits, useToggleHabit } from '../../src/features/habits/useHabitQueries';
import { calculateHabitStreak } from '../../src/utils/streak-utils';

export default function TodayScreen() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();

  const toggleTaskMutation = useToggleTask();
  const createTaskMutation = useCreateTask();
  const toggleHabitMutation = useToggleHabit();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtra solo le task di oggi o non completate
  const todayTasks = (tasks || []).filter((t) => !t.dueDate || t.dueDate === todayStr);

  const completedCount = todayTasks.filter((t) => t.isCompleted).length;
  const totalCount = todayTasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  const handleToggleTask = (id: string) => {
    const task = todayTasks.find((t) => t.id === id);
    if (task) {
      toggleTaskMutation.mutate({ id, isCompleted: task.isCompleted });
    }
  };

  const handleToggleHabit = (habitId: string, isCompletedToday: boolean) => {
    toggleHabitMutation.mutate({
      habitId,
      completionDate: todayStr,
      currentlyCompleted: isCompletedToday,
    });
  };

  const handleCreateTask = (formValues: TaskFormValues) => {
    createTaskMutation.mutate(formValues, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  if (tasksLoading || habitsLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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

        {/* RIEPILOGO GIORNALIERO */}
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

        {/* BANNER GIORNATA CONCLUSA */}
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
          <Pressable style={styles.quickAddButton} onPress={() => setIsModalOpen(true)}>
            <Plus size={16} color={theme.colors.primary} />
            <Text style={styles.quickAddText}>Aggiungi</Text>
          </Pressable>
        </View>

        {todayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nessuna attività programmata per oggi.</Text>
          </View>
        ) : (
          todayTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggleComplete={handleToggleTask} />
          ))
        )}

        {/* SEZIONE ABITUDINI DI OGGI */}
        <View style={[styles.sectionHeader, { marginTop: theme.spacing.lg }]}>
          <Text style={styles.sectionTitle}>Abitudini di oggi</Text>
        </View>

        {habits?.length === 0 ? (
          <Text style={styles.emptyText}>Nessuna abitudine definita.</Text>
        ) : (
          <View style={styles.habitsRow}>
            {habits?.map((habit) => {
              const streakInfo = calculateHabitStreak(
                habit.completions.map((c) => ({ completionDate: c })),
                'DAILY',
                [0, 1, 2, 3, 4, 5, 6]
              );

              return (
                <Pressable
                  key={habit.id}
                  style={[
                    styles.habitCard,
                    habit.isCompletedToday && styles.habitCardCompleted,
                  ]}
                  onPress={() => handleToggleHabit(habit.id, habit.isCompletedToday)}
                >
                  <View style={styles.habitTop}>
                    <Flame size={16} color={theme.colors.warning} />
                    <Text style={styles.streakText}>{streakInfo.currentStreak} gg</Text>
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
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* MODALE DI CREAZIONE ATTIVITÀ */}
      <TaskFormModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </View>
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
    flexWrap: 'wrap',
  },
  habitCard: {
    minWidth: 140,
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