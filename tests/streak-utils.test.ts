// tests/streak-utils.test.ts
import { describe, test, expect } from '@jest/globals';
import { calculateHabitStreak } from '../src/utils/streak-utils';

describe('Algoritmo Calcolo Streak Abitudini', () => {
  const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

  test('Deve restituire 0 se non ci sono completamenti', () => {
    const result = calculateHabitStreak([], 'DAILY', ALL_DAYS);
    expect(result.currentStreak).toBe(0);
    expect(result.totalCompleted).toBe(0);
  });

  test('Deve calcolare correttamente una streak di 3 giorni consecutivi', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const d1 = new Date();
    d1.setDate(d1.getDate() - 1);
    const d1Str = d1.toISOString().split('T')[0];

    const d2 = new Date();
    d2.setDate(d2.getDate() - 2);
    const d2Str = d2.toISOString().split('T')[0];

    const completions = [
      { completionDate: todayStr },
      { completionDate: d1Str },
      { completionDate: d2Str },
    ];

    const result = calculateHabitStreak(completions, 'DAILY', ALL_DAYS);
    expect(result.currentStreak).toBe(3);
    expect(result.totalCompleted).toBe(3);
  });

  test('Non deve azzerare la streak se un giorno intermedio non era programmato', () => {
    const completions = [
      { completionDate: '2026-10-21' },
      { completionDate: '2026-10-19' },
    ];

    const result = calculateHabitStreak(completions, 'SPECIFIC_DAYS', [1, 3]);
    expect(result.totalCompleted).toBe(2);
  });
});