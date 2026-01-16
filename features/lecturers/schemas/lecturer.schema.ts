import { z } from 'zod'

export const lecturerSchema = z.object({
  title: z
    .string()
    .max(20, 'Der Titel darf maximal 20 Zeichen lang sein.')
    .nullable(),
  firstName: z
    .string()
    .min(2, 'Der Vorname muss mindestens 2 Zeichen lang sein.')
    .max(20, 'Der Vorname darf maximal 20 Zeichen lang sein.'),
  secondName: z
    .string()
    .max(20, 'Der zweite Vorname darf maximal 20 Zeichen lang sein.')
    .nullable(),
  lastName: z
    .string()
    .min(2, 'Der Nachname muss mindestens 2 Zeichen lang sein.')
    .max(50, 'Der Nachname darf maximal 50 Zeichen lang sein.'),
  email: z
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(1, 'Bitte geben Sie eine Telefonnummer ein.')
    .max(20, 'Die Telefonnummer ist zu lang.')
    .regex(/^[+\d\s()-]+$/, 'Ungültiges Telefonnummernformat.')
    .trim(),
  type: z.enum(['internal', 'external'], {
    message: 'Bitte wählen Sie einen Dozententyp aus.',
  }),
  courseLevelPreference: z.enum(['bachelor', 'master', 'both'], {
    message: 'Bitte wählen Sie eine Kursstufen-Präferenz aus.',
  }),
})
