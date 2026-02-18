'use server'

import { updateTag } from 'next/cache'
import z from 'zod'

import { qualificationSchema } from '@/features/lecturers'
import { prisma } from '@/features/shared/lib/prisma'

export async function createCourseLecturerQualification(
  courseId: string,
  lecturerId: string,
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

  updateTag('courses')
  updateTag(`course-${courseId}-lecturers`)
}
