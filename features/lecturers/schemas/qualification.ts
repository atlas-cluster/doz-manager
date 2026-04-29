import z from 'zod'

export const qualificationSchema = z.object({
  experience: z.enum(['none', 'other_uni', 'provadis']),
  leadTime: z.enum(['short', 'four_weeks', 'more_weeks']),
})

export const courseAssignmentSchema = z.object({
  isAssigned: z.boolean().optional(),
  experience: z.enum(['none', 'other_uni', 'provadis']).nullable().optional(),
  leadTime: z.enum(['short', 'four_weeks', 'more_weeks']).nullable().optional(),
  courseLevelPreference: z
    .enum(['bachelor', 'master', 'both'])
    .nullable()
    .optional(),
})
