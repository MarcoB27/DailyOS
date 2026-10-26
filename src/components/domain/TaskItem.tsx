import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, Clock } from 'lucide-react-native';
import { Task, TaskPriority } from '../../types';
import { theme } from '../../theme';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  Bassa: theme.colors.textMuted,
  Media: theme.colors.warning,
  Alta: theme.colors.error,
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete }) => {
  return (
    <Pressable
      style={[styles.container, task.isCompleted && styles.containerCompleted]}
      onPress={() => onToggleComplete(task.id)}
    >
      <Pressable
        style={[styles.checkbox, task.isCompleted && styles.checkboxCompleted]}
        onPress={() => onToggleComplete(task.id)}
      >
        {task.isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, task.isCompleted && styles.titleCompleted]}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{task.category}</Text>
          {task.scheduledTime && (
            <View style={styles.timeBadge}>
              <Clock size={12} color={theme.colors.textMuted} />
              <Text style={styles.timeText}>{task.scheduledTime}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[task.priority] }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  containerCompleted: {
    opacity: 0.5,
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
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  content: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  category: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginLeft: theme.spacing.sm,
  },
});