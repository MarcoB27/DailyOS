export type TaskCategory = 'Studio' | 'Lavoro' | 'Allenamento' | 'Personale' | 'Commissioni' | 'Altro';
export type TaskPriority = 'Bassa' | 'Media' | 'Alta';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  estimatedDurationMinutes?: number;
  category: TaskCategory;
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  isCompletedToday: boolean;
  streakCount: number;
}