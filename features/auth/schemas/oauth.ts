import z from 'zod'

export const oauthSchema = z.object({
  clientId: z.string().min(1, 'Client ID ist erforderlich'),
  clientSecret: z.string(),
  issuerUrl: z.string().url('Bitte geben Sie eine gültige URL ein'),
})
