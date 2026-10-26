import { supabase } from '../lib/supabase';
import { SessionType } from '../store/useTimerStore';

export interface FocusSession {
  id: string;
  taskId?: string;
  sessionType: SessionType;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  startedAt: string;
  completedAt?: string;
  status: 'COMPLETED' | 'INTERRUPTED';
}

export const focusService = {
  async saveSession(
    userId: string,
    session: {
      taskId?: string | null;
      sessionType: SessionType;
      plannedDurationSeconds: number;
      actualDurationSeconds: number;
      startedAt: string;
      status: 'COMPLETED' | 'INTERRUPTED';
    }
  ): Promise<void> {
    const { error } = await supabase.from('focus_sessions').insert({
      user_id: userId,
      task_id: session.taskId || null,
      session_type: session.sessionType,
      planned_duration_seconds: session.plannedDurationSeconds,
      actual_duration_seconds: session.actualDurationSeconds,
      started_at: session.startedAt,
      completed_at: new Date().toISOString(),
      status: session.status,
    });

    if (error) throw error;
  },

  async getTodayCompletedFocusStats(userId: string): Promise<{ completedSessions: number; totalFocusMinutes: number }> {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('actual_duration_seconds')
      .eq('user_id', userId)
      .eq('session_type', 'FOCUS')
      .eq('status', 'COMPLETED')
      .gte('created_at', `${todayStr}T00:00:00.000Z`);

    if (error) throw error;

    const completedSessions = data?.length || 0;
    const totalSeconds = (data || []).reduce((acc, curr) => acc + curr.actual_duration_seconds, 0);
    const totalFocusMinutes = Math.round(totalSeconds / 60);

    return { completedSessions, totalFocusMinutes };
  },
};