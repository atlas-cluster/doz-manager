'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function createCourseLecturerAssignment(
  courseId: string,
  lecturerId: string
) {
  await runInTransaction(async (tx) =>
    tx.courseAssignment.create({
      data: {
        courseId: courseId,
        lecturerId: lecturerId,
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
    'courses:create-course-lecturer-assignment',
    [
      { entityType: 'course', entityId: courseId },
      { entityType: 'lecturer', entityId: lecturerId },
    ]
  )
}
