import { parseISO, subDays, format, getDay } from 'date-fns';

export interface HabitCompletionRecord {
  completionDate: string; // YYYY-MM-DD
}

export function calculateHabitStreak(
  completions: HabitCompletionRecord[],
  frequencyType: 'DAILY' | 'SPECIFIC_DAYS',
  scheduledWeekdays: number[] // 0 = Dom, 1 = Lun ... 6 = Sab
): { currentStreak: number; bestStreak: number; totalCompleted: number } {
  if (!completions || completions.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalCompleted: 0 };
  }

  const completionSet = new Set(completions.map((c) => c.completionDate));
  const totalCompleted = completionSet.size;

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  let checkDate = today;

  // Verifica se oggi era previsto ed è stato completato
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayDayOfWeek = getDay(today);
  const isTodayScheduled = frequencyType === 'DAILY' || scheduledWeekdays.includes(todayDayOfWeek);

  // Se oggi era previsto ma non ancora completato, partiamo da ieri per non spezzare la streak in corso
  if (isTodayScheduled && !completionSet.has(todayStr)) {
    checkDate = subDays(today, 1);
  }

  // 1. Calcolo Current Streak
  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const dayOfWeek = getDay(checkDate);
    const isScheduled = frequencyType === 'DAILY' || scheduledWeekdays.includes(dayOfWeek);

    if (isScheduled) {
      if (completionSet.has(dateStr)) {
        currentStreak++;
      } else {
        // Giorno previsto ma non completato: la streak corrente si interrompe
        break;
      }
    }
    // Se non era un giorno previsto, continuiamo a riavvolgere il calendario senza incrementare o azzerare

    checkDate = subDays(checkDate, 1);
    // Limite di sicurezza per evitare loop infiniti (365 giorni indietro)
    if (currentStreak > 365 || subDays(today, 365) > checkDate) break;
  }

  bestStreak = Math.max(currentStreak, totalCompleted);

  return { currentStreak, bestStreak, totalCompleted };
}