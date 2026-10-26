import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../services/task-service';
import { TaskFormValues } from './task-schema';
import { useAuth } from '../../context/AuthContext';

const TASKS_QUERY_KEY = ['tasks'];

export function useTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => taskService.getTasks(),
    enabled: !!user,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (values: TaskFormValues) => {
      if (!user) throw new Error('Utente non autenticato');
      return taskService.createTask(user.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskFormValues }) =>
      taskService.updateTask(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      taskService.toggleTaskComplete(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}