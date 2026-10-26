import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Clock, AlertCircle } from 'lucide-react-native';
import { theme } from '../../theme';
import { Task, TaskCategory, TaskPriority } from '../../types';
import { taskSchema, TaskFormValues } from '../../features/tasks/task-schema';
import { format } from 'date-fns';

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues) => void;
  initialData?: Task | null;
}

const CATEGORIES: TaskCategory[] = [
  'Studio',
  'Lavoro',
  'Allenamento',
  'Personale',
  'Commissioni',
  'Altro',
];
const PRIORITIES: TaskPriority[] = ['Bassa', 'Media', 'Alta'];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const defaultValues: TaskFormValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate || format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: initialData?.scheduledTime || '',
    estimatedDurationMinutes: initialData?.estimatedDurationMinutes
      ? String(initialData.estimatedDurationMinutes)
      : '',
    category: initialData?.category || 'Studio',
    priority: initialData?.priority || 'Media',
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      reset(defaultValues);
    }
  }, [visible, initialData]);

  const handleFormSubmit = (data: TaskFormValues) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* HEADER MODALE */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialData ? 'Modifica attività' : 'Nuova attività'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* TITOLO */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Titolo *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Es. Preparazione esame Architettura 1"
                    placeholderTextColor={theme.colors.textMuted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.title && (
                <View style={styles.errorRow}>
                  <AlertCircle size={12} color={theme.colors.error} />
                  <Text style={styles.errorText}>{errors.title.message}</Text>
                </View>
              )}
            </View>

            {/* DESCRIZIONE */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Descrizione</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Note o dettagli aggiuntivi..."
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                    numberOfLines={3}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>

            {/* SELEZIONE CATEGORIA */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Categoria</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipsContainer}>
                    {CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat}
                        style={[
                          styles.chip,
                          value === cat && styles.chipSelected,
                        ]}
                        onPress={() => onChange(cat)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            value === cat && styles.chipTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* SELEZIONE PRIORITÀ */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Priorità</Text>
              <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.priorityRow}>
                    {PRIORITIES.map((p) => (
                      <Pressable
                        key={p}
                        style={[
                          styles.priorityChip,
                          value === p && styles.priorityChipSelected,
                        ]}
                        onPress={() => onChange(p)}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            value === p && styles.priorityTextSelected,
                          ]}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* ORARIO E DURATA PREVISTA */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Orario (HH:mm)</Text>
                <Controller
                  control={control}
                  name="scheduledTime"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWithIcon}>
                      <Clock size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { paddingLeft: 38 }]}
                        placeholder="14:30"
                        placeholderTextColor={theme.colors.textMuted}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Durata (minuti)</Text>
                <Controller
                  control={control}
                  name="estimatedDurationMinutes"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.estimatedDurationMinutes && styles.inputError]}
                      placeholder="45"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.estimatedDurationMinutes && (
                  <View style={styles.errorRow}>
                    <AlertCircle size={12} color={theme.colors.error} />
                    <Text style={styles.errorText}>{errors.estimatedDurationMinutes.message}</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* PULSANTI AZIONE */}
          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit(handleFormSubmit)}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {initialData ? 'Salva Modifiche' : 'Crea Attività'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '85%',
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  formContainer: {
    marginBottom: theme.spacing.md,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 15,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  chipTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  priorityChipSelected: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderColor: theme.colors.primary,
  },
  priorityText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  priorityTextSelected: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  submitButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});