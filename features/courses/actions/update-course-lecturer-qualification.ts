'use server'

import { updateTag } from 'next/cache'
import z from 'zod'

import { qualificationSchema } from '@/features/lecturers'
import { prisma } from '@/features/shared/lib/prisma'

export async function updateCourseLecturerQualification(
  courseId: string,
  lecturerId: string,
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

  updateTag('courses')
  updateTag(`course-${courseId}-lecturers`)
}
