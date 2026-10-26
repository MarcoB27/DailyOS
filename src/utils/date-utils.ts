import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Buongiorno';
  } else if (hour >= 12 && hour < 18) {
    return 'Buon pomeriggio';
  } else {
    return 'Buonasera';
  }
}

export function getFormattedToday(): string {
  const date = new Date();
  const formatted = format(date, 'EEEE d MMMM', { locale: it });
  // Prima lettera maiuscola (es. "Lunedì 26 ottobre")
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}