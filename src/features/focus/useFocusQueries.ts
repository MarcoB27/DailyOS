import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusService } from '../../services/focus-service';
import { useAuth } from '../../context/AuthContext';
import { SessionType } from '../../store/useTimerStore';

export function useTodayFocusStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['focusStats', 'today', user?.id],
    queryFn: () => (user ? focusService.getTodayCompletedFocusStats(user.id) : { completedSessions: 0, totalFocusMinutes: 0 }),
    enabled: !!user,
  });
}

export function useSaveFocusSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (session: {
      taskId?: string | null;
      sessionType: SessionType;
      plannedDurationSeconds: number;
      actualDurationSeconds: number;
      startedAt: string;
      status: 'COMPLETED' | 'INTERRUPTED';
    }) => {
      if (!user) throw new Error('Utente non autenticato');
      return focusService.saveSession(user.id, session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusStats'] });
    },
  });
}