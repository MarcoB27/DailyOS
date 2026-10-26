import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { TaskFormValues } from '../features/tasks/task-schema';

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      dueDate: row.due_date || undefined,
      scheduledTime: row.scheduled_time || undefined,
      estimatedDurationMinutes: row.estimated_duration_minutes || undefined,
      category: row.category,
      priority: row.priority,
      isCompleted: row.is_completed,
      completedAt: row.completed_at || undefined,
    }));
  },

  async createTask(userId: string, values: TaskFormValues): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: values.title,
        description: values.description || null,
        due_date: values.dueDate,
        scheduled_time: values.scheduledTime || null,
        estimated_duration_minutes: values.estimatedDurationMinutes
          ? Number(values.estimatedDurationMinutes)
          : null,
        category: values.category,
        priority: values.priority,
        is_completed: false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      dueDate: data.due_date || undefined,
      scheduledTime: data.scheduled_time || undefined,
      estimatedDurationMinutes: data.estimated_duration_minutes || undefined,
      category: data.category,
      priority: data.priority,
      isCompleted: data.is_completed,
      completedAt: data.completed_at || undefined,
    };
  },

  async updateTask(id: string, values: TaskFormValues): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: values.title,
        description: values.description || null,
        due_date: values.dueDate,
        scheduled_time: values.scheduledTime || null,
        estimated_duration_minutes: values.estimatedDurationMinutes
          ? Number(values.estimatedDurationMinutes)
          : null,
        category: values.category,
        priority: values.priority,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  async toggleTaskComplete(id: string, currentStatus: boolean): Promise<void> {
    const nextStatus = !currentStatus;
    const { error } = await supabase
      .from('tasks')
      .update({
        is_completed: nextStatus,
        completed_at: nextStatus ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};