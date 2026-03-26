'use server'

import z from 'zod'

import { qualificationSchema } from '@/features/lecturers'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
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

  await notifyTagsUpdated(
    [
      'courses',
      'lecturers',
      `course-${courseId}-lecturers`,
      `lecturer-${lecturerId}-courses`,
    ],
    'courses:create-course-lecturer-qualification',
    [
      { entityType: 'course', entityId: courseId },
      { entityType: 'lecturer', entityId: lecturerId },
    ]
  )
}
