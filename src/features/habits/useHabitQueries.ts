import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitService } from '../../services/habit-service';
import { useAuth } from '../../context/AuthContext';

export function useHabits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['habits', user?.id],
    queryFn: () => (user ? habitService.getHabits(user.id) : []),
    enabled: !!user,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (habit: {
      title: string;
      icon: string;
      color: string;
      frequencyType: 'DAILY' | 'SPECIFIC_DAYS';
      scheduledWeekdays: number[];
    }) => {
      if (!user) throw new Error('Utente non autenticato');
      return habitService.createHabit(user.id, habit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useToggleHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ habitId, completionDate, currentlyCompleted }: { habitId: string; completionDate: string; currentlyCompleted: boolean }) => {
      if (!user) throw new Error('Utente non autenticato');
      return habitService.toggleHabitCompletion(user.id, habitId, completionDate, currentlyCompleted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}