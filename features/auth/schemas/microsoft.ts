import z from 'zod'

export const microsoftSchema = z.object({
  clientId: z.string().min(1, 'Client ID ist erforderlich'),
  clientSecret: z.string(),
  tenantId: z.string().min(1, 'Tenant ID ist erforderlich'),
})
