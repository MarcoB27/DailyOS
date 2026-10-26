import { create } from 'zustand';

export type SessionType = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

interface TimerState {
  sessionType: SessionType;
  status: TimerStatus;
  plannedDurationSeconds: number;
  remainingSeconds: number;
  targetEndTime: number | null; // Timestamp in ms
  selectedTaskId: string | null;
  selectedTaskTitle: string | null;

  // Durate predefinite in minuti
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;

  // Azioni
  setDurations: (focus: number, shortBreak: number, longBreak: number) => void;
  setSessionType: (type: SessionType) => void;
  setSelectedTask: (id: string | null, title: string | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  sessionType: 'FOCUS',
  status: 'IDLE',
  plannedDurationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  targetEndTime: null,
  selectedTaskId: null,
  selectedTaskTitle: null,

  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,

  setDurations: (focus, shortBreak, longBreak) => {
    set({
      focusMinutes: focus,
      shortBreakMinutes: shortBreak,
      longBreakMinutes: longBreak,
    });
    // Se il timer è in IDLE, aggiorna la durata corrente
    const currentType = get().sessionType;
    let mins = focus;
    if (currentType === 'SHORT_BREAK') mins = shortBreak;
    if (currentType === 'LONG_BREAK') mins = longBreak;

    if (get().status === 'IDLE') {
      set({
        plannedDurationSeconds: mins * 60,
        remainingSeconds: mins * 60,
      });
    }
  },

  setSessionType: (type) => {
    const { focusMinutes, shortBreakMinutes, longBreakMinutes } = get();
    let mins = focusMinutes;
    if (type === 'SHORT_BREAK') mins = shortBreakMinutes;
    if (type === 'LONG_BREAK') mins = longBreakMinutes;

    set({
      sessionType: type,
      status: 'IDLE',
      plannedDurationSeconds: mins * 60,
      remainingSeconds: mins * 60,
      targetEndTime: null,
    });
  },

  setSelectedTask: (id, title) => {
    set({ selectedTaskId: id, selectedTaskTitle: title });
  },

  startTimer: () => {
    const { remainingSeconds } = get();
    const targetEndTime = Date.now() + remainingSeconds * 1000;
    set({
      status: 'RUNNING',
      targetEndTime,
    });
  },

  pauseTimer: () => {
    const { targetEndTime } = get();
    if (!targetEndTime) return;
    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.round((targetEndTime - now) / 1000));
    set({
      status: 'PAUSED',
      remainingSeconds,
      targetEndTime: null,
    });
  },

  resumeTimer: () => {
    const { remainingSeconds } = get();
    const targetEndTime = Date.now() + remainingSeconds * 1000;
    set({
      status: 'RUNNING',
      targetEndTime,
    });
  },

  resetTimer: () => {
    const { sessionType, focusMinutes, shortBreakMinutes, longBreakMinutes } = get();
    let mins = focusMinutes;
    if (sessionType === 'SHORT_BREAK') mins = shortBreakMinutes;
    if (sessionType === 'LONG_BREAK') mins = longBreakMinutes;

    set({
      status: 'IDLE',
      plannedDurationSeconds: mins * 60,
      remainingSeconds: mins * 60,
      targetEndTime: null,
    });
  },

  tick: () => {
    const { status, targetEndTime } = get();
    if (status !== 'RUNNING' || !targetEndTime) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.round((targetEndTime - now) / 1000));

    if (remaining <= 0) {
      set({
        remainingSeconds: 0,
        status: 'COMPLETED',
        targetEndTime: null,
      });
    } else {
      set({ remainingSeconds: remaining });
    }
  },

  completeTimer: () => {
    set({
      status: 'COMPLETED',
      remainingSeconds: 0,
      targetEndTime: null,
    });
  },
}));