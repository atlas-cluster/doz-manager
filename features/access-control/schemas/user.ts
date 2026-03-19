import { z } from 'zod'

export const userSchema = z.object({
  name: z
    .string()
    .min(2, 'Der Name muss mindestens 2 Zeichen lang sein.')
    .max(100, 'Der Name darf maximal 100 Zeichen lang sein.'),
  email: z.email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  image: z
    .url('Bitte geben Sie eine gültige URL ein.')
    .or(z.literal(''))
    .nullable()
    .optional(),
  password: z
    .union([
      z
        .string()
        .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
        .max(128, 'Das Passwort darf maximal 128 Zeichen lang sein.'),
      z.literal(''),
    ])
    .optional(),
})
