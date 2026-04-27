'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function deleteLecturerCourseQualification(
  lecturerId: string,
  courseId: string
) {
  await runInTransaction(async (tx) =>
    tx.courseQualification.delete({
      where: {
        lecturerId_courseId: {
          lecturerId: lecturerId,
          courseId: courseId,
        },
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
    'lecturers:delete-lecturer-course-qualification',
    [
      { entityType: 'lecturer', entityId: lecturerId },
      { entityType: 'course', entityId: courseId },
    ]
  )
}
