'use server'

import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { prisma } from '@/features/shared/lib/prisma'

export async function createLecturerCourseAssignment(
  lecturerId: string,
  courseId: string
) {
  await prisma.courseAssignment.create({
    data: {
      courseId: courseId,
      lecturerId: lecturerId,
    },
  })

  await notifyTagsUpdated(
    [
      'lecturers',
      'courses',
      `lecturer-${lecturerId}-courses`,
      `course-${courseId}-lecturers`,
    ],
    'lecturers:create-lecturer-course-assignment',
    [
      { entityType: 'lecturer', entityId: lecturerId },
      { entityType: 'course', entityId: courseId },
    ]
  )
}
