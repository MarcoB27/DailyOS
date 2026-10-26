import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Check, Clock, Calendar, Edit3, Trash2 } from 'lucide-react-native';
import { Task, TaskPriority } from '../../types';
import { theme } from '../../theme';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  Bassa: theme.colors.textMuted,
  Media: theme.colors.warning,
  Alta: theme.colors.error,
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Elimina Attività',
      `Sei sicuro di voler eliminare "${task.title}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => onDelete(task.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, task.isCompleted && styles.containerCompleted]}>
      {/* HEADER CARD: CHECKBOX + TITOLO */}
      <View style={styles.topRow}>
        <Pressable
          style={[styles.checkbox, task.isCompleted && styles.checkboxCompleted]}
          onPress={() => onToggleComplete(task.id)}
        >
          {task.isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={[styles.title, task.isCompleted && styles.titleCompleted]}>
            {task.title}
          </Text>
          {task.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}
        </View>

        {/* INDICATORE PRIORITÀ */}
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: `${priorityColors[task.priority]}20` },
          ]}
        >
          <Text style={[styles.priorityText, { color: priorityColors[task.priority] }]}>
            {task.priority}
          </Text>
        </View>
      </View>

      {/* METADATI E AZIONI */}
      <View style={styles.bottomRow}>
        <View style={styles.metaRow}>
          <Text style={styles.categoryBadge}>{task.category}</Text>

          {task.dueDate && (
            <View style={styles.metaBadge}>
              <Calendar size={12} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>{task.dueDate}</Text>
            </View>
          )}

          {task.scheduledTime && (
            <View style={styles.metaBadge}>
              <Clock size={12} color={theme.colors.textMuted} />
              <Text style={styles.metaText}>{task.scheduledTime}</Text>
            </View>
          )}
        </View>

        {/* PULSANTI EDIT & DELETE */}
        <View style={styles.actions}>
          <Pressable onPress={() => onEdit(task)} style={styles.actionButton}>
            <Edit3 size={16} color={theme.colors.textMuted} />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.actionButton}>
            <Trash2 size={16} color={theme.colors.error} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  containerCompleted: {
    opacity: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
});