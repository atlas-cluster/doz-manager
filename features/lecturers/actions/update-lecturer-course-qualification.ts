'use server'

import z from 'zod'

import { qualificationSchema } from '@/features/lecturers/schemas/qualification'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function updateLecturerQualification(
  lecturerId: string,
  courseId: string,
  data: z.infer<typeof qualificationSchema>
) {
  await runInTransaction(async (tx) =>
    tx.courseQualification.update({
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
  )

  await notifyTagsUpdated(
    [
      'lecturers',
      'courses',
      `lecturer-${lecturerId}-courses`,
      `course-${courseId}-lecturers`,
    ],
    'lecturers:update-lecturer-course-qualification',
    [
      { entityType: 'lecturer', entityId: lecturerId },
      { entityType: 'course', entityId: courseId },
    ]
  )
}
