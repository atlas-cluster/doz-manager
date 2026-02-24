import z from 'zod'

export const qualificationSchema = z.object({
  experience: z.enum(['none', 'other_uni', 'provadis']),
  leadTime: z.enum(['short', 'four_weeks', 'more_weeks']),
})
