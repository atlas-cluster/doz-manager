'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturerCourseQualification(
  lecturerId: string,
  courseId: string
) {
  await prisma.courseQualification.delete({
    where: {
      lecturerId_courseId: {
        lecturerId: lecturerId,
        courseId: courseId,
      },
    },
  })

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
