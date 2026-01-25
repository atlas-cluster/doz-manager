import { z } from 'zod'

export const lecturerSchema = z.object({
  title: z
    .string()
    .max(20, 'Der Titel darf maximal 20 Zeichen lang sein.')
    .regex(
      /^[\p{L}\s.'-]*$/u,
      'Der Titel enthält ungültige Zeichen (erlaubt: Buchstaben, Leerzeichen, Punkte, Bindestriche, Apostrophe).'
    )
    .nullable(),
  firstName: z
    .string()
    .min(1, 'Der Vorname muss mindestens 1 Zeichen lang sein.')
    .max(50, 'Der Vorname darf maximal 50 Zeichen lang sein.')
    .regex(
      /^[\p{L}\s.'-]*$/u,
      'Der Vorname enthält ungültige Zeichen (erlaubt: Buchstaben, Leerzeichen, Punkte, Bindestriche, Apostrophe).'
    ),
  secondName: z
    .string()
    .max(50, 'Der zweite Vorname darf maximal 50 Zeichen lang sein.')
    .regex(
      /^[\p{L}\s.'-]*$/u,
      'Der zweite Vorname enthält ungültige Zeichen (erlaubt: Buchstaben, Leerzeichen, Punkte, Bindestriche, Apostrophe).'
    )
    .nullable(),
  lastName: z
    .string()
    .min(1, 'Der Nachname muss mindestens 1 Zeichen lang sein.')
    .max(50, 'Der Nachname darf maximal 50 Zeichen lang sein.')
    .regex(
      /^[\p{L}\s.'-]*$/u,
      'Der Nachname enthält ungültige Zeichen (erlaubt: Buchstaben, Leerzeichen, Punkte, Bindestriche, Apostrophe).'
    ),
  email: z.email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  phone: z
    .string()
    .min(1, 'Bitte geben Sie eine Telefonnummer ein.')
    .max(20, 'Die Telefonnummer ist zu lang.')
    .regex(/^[+\d]+$/, 'Ungültiges Telefonnummernformat.')
    .trim(),
  type: z.enum(['internal', 'external'], {
    message: 'Bitte wählen Sie einen Dozententyp aus.',
  }),
  courseLevelPreference: z.enum(['bachelor', 'master', 'both'], {
    message: 'Bitte wählen Sie eine Vorlesungsstufen-Präferenz aus.',
  }),
})
