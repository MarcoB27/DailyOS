import { supabase } from '../lib/supabase';
import { Habit } from '../types';

export interface HabitWithCompletions extends Habit {
  completions: string[]; // Array di date YYYY-MM-DD
}

export const habitService = {
  async getHabits(userId: string): Promise<HabitWithCompletions[]> {
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (habitsError) throw habitsError;

    const { data: completionsData, error: completionsError } = await supabase
      .from('habit_completions')
      .select('habit_id, completion_date')
      .eq('user_id', userId);

    if (completionsError) throw completionsError;

    const todayStr = new Date().toISOString().split('T')[0];

    return (habitsData || []).map((h) => {
      const habitCompletions = (completionsData || [])
        .filter((c) => c.habit_id === h.id)
        .map((c) => c.completion_date);

      const isCompletedToday = habitCompletions.includes(todayStr);

      return {
        id: h.id,
        title: h.title,
        icon: h.icon,
        color: h.color,
        isCompletedToday,
        streakCount: 0, // Calcolato nel frontend tramite streak-utils
        completions: habitCompletions,
      };
    });
  },

  async createHabit(
    userId: string,
    habit: {
      title: string;
      icon: string;
      color: string;
      frequencyType: 'DAILY' | 'SPECIFIC_DAYS';
      scheduledWeekdays: number[];
    }
  ): Promise<void> {
    const { error } = await supabase.from('habits').insert({
      user_id: userId,
      title: habit.title,
      icon: habit.icon,
      color: habit.color,
      frequency_type: habit.frequencyType,
      scheduled_weekdays: habit.scheduledWeekdays,
    });

    if (error) throw error;
  },

  async toggleHabitCompletion(userId: string, habitId: string, completionDate: string, currentlyCompleted: boolean): Promise<void> {
    if (currentlyCompleted) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .eq('completion_date', completionDate);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('habit_completions').insert({
        user_id: userId,
        habit_id: habitId,
        completion_date: completionDate,
      });

      if (error) throw error;
    }
  },

  async archiveHabit(id: string): Promise<void> {
    const { error } = await supabase.from('habits').update({ is_archived: true }).eq('id', id);
    if (error) throw error;
  },
};