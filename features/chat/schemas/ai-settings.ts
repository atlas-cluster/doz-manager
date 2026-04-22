import z from 'zod'

export const aiSettingsSchema = z.object({
  baseUrl: z.string().url('Bitte eine gültige URL eingeben').or(z.literal('')),
  apiKey: z.string().optional(),
  model: z.string().min(1, 'Modellname ist erforderlich'),
  timeoutMs: z
    .number()
    .int()
    .min(1000, 'Timeout muss mindestens 1000ms sein')
    .max(600000, 'Timeout darf maximal 600000ms (10 Min.) sein'),
})
