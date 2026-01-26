import { z } from 'zod'

export const courseSchema = z.object({
  name: z
    .string()
    .min(2, 'Der Name muss mindestens 2 Zeichen lang sein.')
    .max(50, 'Der Name darf maximal 50 Zeichen lang sein.')
    .regex(
      /^[\p{L}\s\d'-]*$/u,
      'Der Name darf nur Buchstaben, Zahlen, Leerzeichen, Bindestriche und Apostrophe enthalten.'
    ),
  isOpen: z.boolean(),
  courseLevel: z.enum(['bachelor', 'master'], {
    message: 'Bitte wählen Sie eine Vorlesungsstufe aus.',
  }),
  semester: z
    .int('Das Semester muss eine ganze Zahl sein.')
    .min(1, 'Das Semester muss mindestens 1 sein.')
    .max(12, 'Das Semester darf maximal 12 sein.')
    .nullable(),
})
