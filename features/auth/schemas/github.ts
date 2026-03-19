import z from 'zod'

export const githubSchema = z.object({
  clientId: z.string().min(1, 'Client ID ist erforderlich'),
  clientSecret: z.string(),
})
