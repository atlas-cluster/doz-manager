'use server'

import { updateTag } from 'next/cache'
import z from 'zod'

import { qualificationSchema } from '@/features/lecturers/schemas/lecturer'
import { prisma } from '@/features/shared/lib/prisma'

export async function upsertLecturerQualification(
  lecturerId: string,
  courseId: string,
  data: z.infer<typeof qualificationSchema>
) {
  await prisma.courseQualification.upsert({
    where: {
      lecturerId_courseId: {
        lecturerId: lecturerId,
        courseId: courseId,
      },
    },
    update: {
      leadTime: data.leadTime,
      experience: data.experience,
    },
    create: {
      lecturerId: lecturerId,
      courseId: courseId,
      leadTime: data.leadTime,
      experience: data.experience,
    },
  })

  updateTag('lecturers')
  updateTag(`lecturer-${lecturerId}-courses`)
}
