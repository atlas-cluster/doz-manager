'use server'

import { updateTag } from 'next/cache'
import z from 'zod'

import { qualificationSchema } from '@/features/lecturers/schemas/qualification'
import { prisma } from '@/features/shared/lib/prisma'

export async function createLecturerQualification(
  lecturerId: string,
  courseId: string,
  data: z.infer<typeof qualificationSchema>
) {
  await prisma.courseQualification.create({
    data: {
      lecturerId: lecturerId,
      courseId: courseId,
      leadTime: data.leadTime,
      experience: data.experience,
    },
  })

  updateTag('lecturers')
  updateTag(`lecturer-${lecturerId}-courses`)
}
