'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function deleteCourseAssignment(
  lecturerId: string,
  courseId: string
) {
  await runInTransaction(async (tx) =>
    tx.courseAssignment.delete({
      where: {
        lecturerId_courseId: { lecturerId, courseId },
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
    'course-assignments:delete',
    [
      { entityType: 'lecturer', entityId: lecturerId },
      { entityType: 'course', entityId: courseId },
    ]
  )
}
