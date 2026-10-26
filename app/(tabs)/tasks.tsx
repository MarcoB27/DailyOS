// app/(tabs)/tasks.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { Plus, Search, ArrowUpDown } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { Task } from '../../src/types';
import { TaskCard } from '../../src/components/domain/TaskCard';
import { TaskFormModal } from '../../src/components/domain/TaskFormModal';
import { TaskFormValues } from '../../src/features/tasks/task-schema';
import {
  filterTasks,
  sortTasks,
  TaskFilter,
  TaskSortBy,
} from '../../src/features/tasks/task-utils';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Ripassare architettura calcolatori',
    description: 'Capitoli 3 e 4 sul set di istruzioni MIPS e pipeline',
    dueDate: '2026-10-26',
    scheduledTime: '10:00',
    category: 'Studio',
    priority: 'Alta',
    isCompleted: false,
  },
  {
    id: '2',
    title: 'Allenamento Full Body',
    dueDate: '2026-10-26',
    scheduledTime: '18:00',
    category: 'Allenamento',
    priority: 'Media',
    isCompleted: true,
  },
  {
    id: '3',
    title: 'Spesa settimanale',
    dueDate: '2026-10-27',
    category: 'Commissioni',
    priority: 'Bassa',
    isCompleted: false,
  },
];

const FILTERS: TaskFilter[] = [
  'Tutte',
  'Oggi',
  'Domani',
  'Questa settimana',
  'In ritardo',
  'Completate',
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('Tutte');
  const [sortBy, setSortBy] = useState<TaskSortBy>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Gestione Modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filtraggio e Ordinamento
  const filtered = filterTasks(tasks, activeFilter, searchQuery);
  const visibleTasks = sortTasks(filtered, sortBy);

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isCompleted: !t.isCompleted,
              completedAt: !t.isCompleted ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formValues: TaskFormValues) => {
    if (editingTask) {
      // Modifica
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: formValues.title,
                description: formValues.description,
                dueDate: formValues.dueDate,
                scheduledTime: formValues.scheduledTime || undefined,
                estimatedDurationMinutes: formValues.estimatedDurationMinutes
                  ? Number(formValues.estimatedDurationMinutes)
                  : undefined,
                category: formValues.category,
                priority: formValues.priority,
              }
            : t
        )
      );
    } else {
      // Creazione
      const newTask: Task = {
        id: Date.now().toString(),
        title: formValues.title,
        description: formValues.description,
        dueDate: formValues.dueDate,
        scheduledTime: formValues.scheduledTime || undefined,
        estimatedDurationMinutes: formValues.estimatedDurationMinutes
          ? Number(formValues.estimatedDurationMinutes)
          : undefined,
        category: formValues.category,
        priority: formValues.priority,
        isCompleted: false,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const cycleSortBy = () => {
    if (sortBy === 'priority') setSortBy('scheduledTime');
    else if (sortBy === 'scheduledTime') setSortBy('category');
    else setSortBy('priority');
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'priority': return 'Priorità';
      case 'scheduledTime': return 'Orario';
      case 'category': return 'Categoria';
    }
  };

  return (
    <View style={styles.container}>
      {/* BARRA DI RICERCA ED ORDINAMENTO */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Search size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca attività..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Pressable style={styles.sortButton} onPress={cycleSortBy}>
          <ArrowUpDown size={16} color={theme.colors.primary} />
          <Text style={styles.sortText}>{getSortLabel()}</Text>
        </Pressable>
      </View>

      {/* CHIPS DI FILTRAGGIO */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTERS.map((f) => {
            const isSelected = activeFilter === f;
            return (
              <Pressable
                key={f}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* LISTA ATTIVITÀ */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {visibleTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nessuna attività trovata</Text>
            <Text style={styles.emptySubtitle}>
              Non ci sono attività per i filtri selezionati.
            </Text>
          </View>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleTaskComplete}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </ScrollView>

      {/* FAB (FLOATING ACTION BUTTON) PER NUOVA ATTIVITÀ */}
      <Pressable style={styles.fab} onPress={handleOpenCreateModal}>
        <Plus size={24} color="#FFFFFF" />
      </Pressable>

      {/* MODALE CREAZIONE/MODIFICA */}
      <TaskFormModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: theme.colors.text,
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  sortText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  filtersWrapper: {
    marginVertical: theme.spacing.md,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 80,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});