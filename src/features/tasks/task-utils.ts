import { isToday, isTomorrow, isThisWeek, isPast, parseISO } from 'date-fns';
import { Task } from '../../types';

export type TaskFilter = 'Tutte' | 'Oggi' | 'Domani' | 'Questa settimana' | 'In ritardo' | 'Completate';
export type TaskSortBy = 'scheduledTime' | 'priority' | 'category';

const PRIORITY_WEIGHTS: Record<string, number> = {
  Alta: 3,
  Media: 2,
  Bassa: 1,
};

export function filterTasks(tasks: Task[], filter: TaskFilter, searchQuery: string = ''): Task[] {
  const todayStr = new Date().toISOString().split('T')[0];

  return tasks.filter((task) => {
    // Filtro per testo di ricerca
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDesc = task.description?.toLowerCase().includes(query) ?? false;
      const matchesCategory = task.category.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
    }

    const taskDate = task.dueDate ? parseISO(task.dueDate) : null;

    switch (filter) {
      case 'Oggi':
        return taskDate ? isToday(taskDate) : true;
      case 'Domani':
        return taskDate ? isTomorrow(taskDate) : false;
      case 'Questa settimana':
        return taskDate ? isThisWeek(taskDate, { weekStartsOn: 1 }) : false;
      case 'In ritardo':
        return !task.isCompleted && task.dueDate ? task.dueDate < todayStr : false;
      case 'Completate':
        return task.isCompleted;
      case 'Tutte':
      default:
        return true;
    }
  });
}

export function sortTasks(tasks: Task[], sortBy: TaskSortBy): Task[] {
  return [...tasks].sort((a, b) => {
    // Mantieni le attività non completate in alto
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }

    if (sortBy === 'priority') {
      return (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
    }

    if (sortBy === 'scheduledTime') {
      const timeA = a.scheduledTime || '23:59';
      const timeB = b.scheduledTime || '23:59';
      return timeA.localeCompare(timeB);
    }

    if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }

    return 0;
  });
}