import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

export interface DayStat {
  dayLabel: string; // Es. "Lun", "Mar"
  dateStr: string;  // YYYY-MM-DD
  tasksCompleted: number;
  focusMinutes: number;
}

export interface WeeklyProgressData {
  days: DayStat[];
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  mostProductiveDay: string; // Nome del giorno con più attività/focus
}

export const progressService = {
  async getWeeklyStats(userId: string): Promise<WeeklyProgressData> {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const startDateStr = format(weekStart, 'yyyy-MM-dd');
    const endDateStr = format(weekEnd, 'yyyy-MM-dd');

    // 1. Fetch delle task completate nella settimana
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('completed_at', `${startDateStr}T00:00:00.000Z`)
      .lte('completed_at', `${endDateStr}T23:59:59.999Z`);

    if (tasksError) throw tasksError;

    // 2. Fetch delle sessioni focus completate nella settimana
    const { data: focusData, error: focusError } = await supabase
      .from('focus_sessions')
      .select('created_at, actual_duration_seconds')
      .eq('user_id', userId)
      .eq('session_type', 'FOCUS')
      .eq('status', 'COMPLETED')
      .gte('created_at', `${startDateStr}T00:00:00.000Z`)
      .lte('created_at', `${endDateStr}T23:59:59.999Z`);

    if (focusError) throw focusError;

    // 3. Generazione dei 7 giorni della settimana corrente
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    let totalTasksCompleted = 0;
    let totalFocusMinutes = 0;
    let maxActivityScore = -1;
    let mostProductiveDay = 'N/D';

    const days: DayStat[] = daysInWeek.map((dayDate) => {
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const dayLabel = format(dayDate, 'EEE', { locale: it });
      const capitalizedLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);

      // Conteggio task completate in questo giorno
      const tasksCompleted = (tasksData || []).filter((t) => {
        if (!t.completed_at) return false;
        return isSameDay(parseISO(t.completed_at), dayDate);
      }).length;

      // Conteggio minuti focus in questo giorno
      const secondsFocus = (focusData || [])
        .filter((f) => isSameDay(parseISO(f.created_at), dayDate))
        .reduce((sum, curr) => sum + curr.actual_duration_seconds, 0);

      const focusMinutes = Math.round(secondsFocus / 60);

      totalTasksCompleted += tasksCompleted;
      totalFocusMinutes += focusMinutes;

      // Punteggio sintetico di produttività per identificare il giorno migliore
      const activityScore = tasksCompleted * 2 + focusMinutes;
      if (activityScore > maxActivityScore && activityScore > 0) {
        maxActivityScore = activityScore;
        const fullDayName = format(dayDate, 'EEEE', { locale: it });
        mostProductiveDay = fullDayName.charAt(0).toUpperCase() + fullDayName.slice(1);
      }

      return {
        dayLabel: capitalizedLabel,
        dateStr,
        tasksCompleted,
        focusMinutes,
      };
    });

    return {
      days,
      totalTasksCompleted,
      totalFocusMinutes,
      mostProductiveDay,
    };
  },
};