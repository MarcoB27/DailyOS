-- 1. TABELLA PROFILI
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger per creare automaticamente un profilo quando un utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABELLA TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  scheduled_time TIME,
  estimated_duration_minutes INT CHECK (estimated_duration_minutes > 0),
  category TEXT NOT NULL CHECK (category IN ('Studio', 'Lavoro', 'Allenamento', 'Personale', 'Commissioni', 'Altro')),
  priority TEXT NOT NULL CHECK (priority IN ('Bassa', 'Media', 'Alta')),
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indice per ottimizzare le query per utente e data
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON public.tasks(user_id, due_date);

-- 3. ABILITAZIONE RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- POLICIES PROFILES
CREATE POLICY "Gli utenti possono leggere il proprio profilo"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Gli utenti possono aggiornare il proprio profilo"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- POLICIES TASKS
CREATE POLICY "Gli utenti possono vedere solo le proprie task"
  ON public.tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono inserire le proprie task"
  ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono aggiornare le proprie task"
  ON public.tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono eliminare le proprie task"
  ON public.tasks FOR DELETE USING (auth.uid() = user_id);