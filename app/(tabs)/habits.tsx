// app/(tabs)/habits.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal } from 'react-native';
import { Plus, Flame, Check, Trash2, X } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useHabits, useCreateHabit, useToggleHabit } from '../../src/features/habits/useHabitQueries';
import { calculateHabitStreak } from '../../src/utils/streak-utils';

export default function HabitsScreen() {
  const { data: habits, isLoading } = useHabits();
  const toggleHabitMutation = useToggleHabit();
  const createHabitMutation = useCreateHabit();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggle = (habitId: string, isCompletedToday: boolean) => {
    toggleHabitMutation.mutate({
      habitId,
      completionDate: todayStr,
      currentlyCompleted: isCompletedToday,
    });
  };

  const handleCreate = () => {
    if (!newTitle.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per l\'abitudine');
      return;
    }
    createHabitMutation.mutate(
      {
        title: newTitle.trim(),
        icon: 'flame',
        color: '#7C3AED',
        frequencyType: 'DAILY',
        scheduledWeekdays: [0, 1, 2, 3, 4, 5, 6],
      },
      {
        onSuccess: () => {
          setNewTitle('');
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <Text style={styles.loadingText}>Caricamento abitudini...</Text>
        ) : habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Flame size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>Nessuna abitudine creata</Text>
            <Text style={styles.emptySub}>Crea la tua prima abitudine quotidiana per iniziare a tracciare i tuoi progressi.</Text>
          </View>
        ) : (
          habits?.map((habit) => {
            const streakInfo = calculateHabitStreak(
              habit.completions.map((c) => ({ completionDate: c })),
              'DAILY',
              [0, 1, 2, 3, 4, 5, 6]
            );

            return (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitMain}>
                  <Pressable
                    style={[styles.checkbox, habit.isCompletedToday && styles.checkboxCompleted]}
                    onPress={() => handleToggle(habit.id, habit.isCompletedToday)}
                  >
                    {habit.isCompletedToday && <Check size={16} color="#FFF" strokeWidth={3} />}
                  </Pressable>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitTitle, habit.isCompletedToday && styles.habitTitleCompleted]}>
                      {habit.title}
                    </Text>
                    <View style={styles.streakBadge}>
                      <Flame size={14} color={theme.colors.warning} />
                      <Text style={styles.streakText}>
                        Serie attuale: <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>{streakInfo.currentStreak} giorni</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB PER AGGIUNGERE ABITUDINE */}
      <Pressable style={styles.fab} onPress={() => setIsModalOpen(true)}>
        <Plus size={24} color="#FFF" />
      </Pressable>

      {/* MODALE CREAZIONE ABITUDINE */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuova Abitudine</Text>
              <Pressable onPress={() => setIsModalOpen(false)}>
                <X size={20} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.label}>Nome dell'abitudine *</Text>
            <TextInput
              style={styles.input}
              placeholder="Es. Bere 2L d'acqua, Leggere 20 pag..."
              placeholderTextColor={theme.colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelButton} onPress={() => setIsModalOpen(false)}>
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </Pressable>
              <Pressable style={styles.submitButton} onPress={handleCreate}>
                <Text style={styles.submitButtonText}>Salva Abitudine</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 80,
  },
  loadingText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  habitCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  habitMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  habitTitleCompleted: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  streakText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: theme.spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});