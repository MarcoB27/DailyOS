import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Il titolo è obbligatorio')
    .max(100, 'Il titolo non può superare 100 caratteri'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'La data è obbligatoria'),
  scheduledTime: z.string().optional(),
  estimatedDurationMinutes: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))),
      { message: 'La durata deve essere un numero intero positivo' }
    ),
  category: z.enum([
    'Studio',
    'Lavoro',
    'Allenamento',
    'Personale',
    'Commissioni',
    'Altro',
  ]),
  priority: z.enum(['Bassa', 'Media', 'Alta']),
});

export type TaskFormValues = z.infer<typeof taskSchema>;