'use server'

import { updateTag } from 'next/cache'
import z from 'zod'

import { qualificationSchema } from '@/features/lecturers/schemas/qualification'
import { prisma } from '@/features/shared/lib/prisma'

export async function updateLecturerQualification(
  lecturerId: string,
  courseId: string,
  data: z.infer<typeof qualificationSchema>
) {
  await prisma.courseQualification.update({
    where: {
      lecturerId_courseId: {
        lecturerId: lecturerId,
        courseId: courseId,
      },
    },
    data: {
      leadTime: data.leadTime,
      experience: data.experience,
    },
  })

  updateTag('lecturers')
  updateTag(`lecturer-${lecturerId}-courses`)
}
