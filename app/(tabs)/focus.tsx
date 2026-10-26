// app/(tabs)/focus.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  AppState,
  Alert,
} from 'react-native';
import { Play, Pause, RotateCcw, CheckCircle, Target } from 'lucide-react-native';
import { theme } from '../../src/theme';
import { useTimerStore, SessionType } from '../../src/store/useTimerStore';
import { useTodayFocusStats, useSaveFocusSession } from '../../src/features/focus/useFocusQueries';
import { useTasks } from '../../src/features/tasks/useTaskQueries';

export default function FocusScreen() {
  const {
    sessionType,
    status,
    plannedDurationSeconds,
    remainingSeconds,
    selectedTaskTitle,
    selectedTaskId,
    setSessionType,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    tick,
    completeTimer,
  } = useTimerStore();

  const { data: focusStats } = useTodayFocusStats();
  const saveSessionMutation = useSaveFocusSession();
  const { data: tasks } = useTasks();

  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  // Interval Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (status === 'RUNNING') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, tick]);

  // Gestione ripresa da Background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && status === 'RUNNING') {
        tick();
      }
    });
    return () => subscription.remove();
  }, [status, tick]);

  // Gestione completamento timer
  useEffect(() => {
    if (status === 'COMPLETED' && sessionStartTime) {
      if (sessionType === 'FOCUS') {
        saveSessionMutation.mutate({
          taskId: selectedTaskId,
          sessionType,
          plannedDurationSeconds,
          actualDurationSeconds: plannedDurationSeconds,
          startedAt: sessionStartTime,
          status: 'COMPLETED',
        });
        Alert.alert('Sessione Completata! 🎉', 'Ottimo lavoro. Ora prenditi una pausa.');
      }
      setSessionStartTime(null);
    }
  }, [status]);

  const handleStart = () => {
    setSessionStartTime(new Date().toISOString());
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    resumeTimer();
  };

  const handleReset = () => {
    if (status === 'RUNNING' && sessionStartTime && sessionType === 'FOCUS') {
      const elapsed = plannedDurationSeconds - remainingSeconds;
      if (elapsed > 60) {
        saveSessionMutation.mutate({
          taskId: selectedTaskId,
          sessionType,
          plannedDurationSeconds,
          actualDurationSeconds: elapsed,
          startedAt: sessionStartTime,
          status: 'INTERRUPTED',
        });
      }
    }
    setSessionStartTime(null);
    resetTimer();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = plannedDurationSeconds > 0 ? (plannedDurationSeconds - remainingSeconds) / plannedDurationSeconds : 0;

  return (
    <View style={styles.container}>
      {/* SELETTORE MODALITÀ */}
      <View style={styles.tabContainer}>
        {(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK'] as SessionType[]).map((type) => {
          const isSelected = sessionType === type;
          let label = 'Focus';
          if (type === 'SHORT_BREAK') label = 'Pausa Breve';
          if (type === 'LONG_BREAK') label = 'Pausa Lunga';

          return (
            <Pressable
              key={type}
              style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              onPress={() => setSessionType(type)}
              disabled={status === 'RUNNING'}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* TIMER VISUALE */}
      <View style={styles.timerWrapper}>
        <View style={styles.outerCircle}>
          <View style={[styles.innerCircle, { borderColor: sessionType === 'FOCUS' ? theme.colors.primary : theme.colors.success }]}>
            <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
            <Text style={styles.statusSubtext}>
              {status === 'RUNNING' ? 'In corso...' : status === 'PAUSED' ? 'In pausa' : 'Pronto'}
            </Text>
          </View>
        </View>
      </View>

      {/* TASK ASSOCIATA (Facoltativa) */}
      <View style={styles.taskCard}>
        <Target size={18} color={theme.colors.primary} />
        <Text style={styles.taskText} numberOfLines={1}>
          {selectedTaskTitle ? `Obiettivo: ${selectedTaskTitle}` : 'Nessuna attività collegata'}
        </Text>
      </View>

      {/* CONTROLLI */}
      <View style={styles.controlsRow}>
        <Pressable style={styles.secondaryButton} onPress={handleReset}>
          <RotateCcw size={22} color={theme.colors.textMuted} />
        </Pressable>

        {status === 'IDLE' && (
          <Pressable style={styles.mainButton} onPress={handleStart}>
            <Play size={28} color="#FFF" style={{ marginLeft: 4 }} />
          </Pressable>
        )}

        {status === 'RUNNING' && (
          <Pressable style={[styles.mainButton, { backgroundColor: theme.colors.warning }]} onPress={handlePause}>
            <Pause size={28} color="#FFF" />
          </Pressable>
        )}

        {status === 'PAUSED' && (
          <Pressable style={styles.mainButton} onPress={handleResume}>
            <Play size={28} color="#FFF" style={{ marginLeft: 4 }} />
          </Pressable>
        )}

        {status === 'RUNNING' && (
          <Pressable style={styles.secondaryButton} onPress={completeTimer}>
            <CheckCircle size={22} color={theme.colors.success} />
          </Pressable>
        )}
      </View>

      {/* STATISTICHE OGGI */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{focusStats?.completedSessions || 0}</Text>
          <Text style={styles.statLabel}>Sessioni completate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{focusStats?.totalFocusMinutes || 0}m</Text>
          <Text style={styles.statLabel}>Tempo totale Focus</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.surfaceHighlight,
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.xl,
  },
  outerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  innerCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  statusSubtext: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
    maxWidth: '90%',
  },
  taskText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
});