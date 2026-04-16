'use server'

import z from 'zod'

import { qualificationSchema } from '@/features/lecturers'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function createCourseLecturerQualification(
  courseId: string,
  lecturerId: string,
  data: z.infer<typeof qualificationSchema>
) {
  await runInTransaction(async (tx) =>
    tx.courseQualification.create({
      data: {
        lecturerId: lecturerId,
        courseId: courseId,
        leadTime: data.leadTime,
        experience: data.experience,
      },
    })
  )

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
