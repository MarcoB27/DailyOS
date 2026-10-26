import { useQuery } from '@tanstack/react-query';
import { progressService } from '../../services/progress-service';
import { useAuth } from '../../context/AuthContext';

export function useWeeklyProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['weeklyProgress', user?.id],
    queryFn: () => (user ? progressService.getWeeklyStats(user.id) : null),
    enabled: !!user,
  });
}