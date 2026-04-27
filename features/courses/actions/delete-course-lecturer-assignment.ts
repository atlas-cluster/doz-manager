'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function deleteCourseLecturerAssignment(
  courseId: string,
  lecturerId: string
) {
  await runInTransaction(async (tx) =>
    tx.courseAssignment.delete({
      where: {
        lecturerId_courseId: {
          lecturerId,
          courseId,
        },
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
    'courses:delete-course-lecturer-assignment',
    [
      { entityType: 'course', entityId: courseId },
      { entityType: 'lecturer', entityId: lecturerId },
    ]
  )
}
