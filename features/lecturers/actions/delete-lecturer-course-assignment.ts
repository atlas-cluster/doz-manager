'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturerCourseAssignment(
  lecturerId: string,
  courseId: string
) {
  await prisma.courseAssignment.delete({
    where: {
      lecturerId_courseId: {
        lecturerId,
        courseId,
      },
    },
  })

  updateTag('lecturers')
  updateTag('courses')
  updateTag(`lecturer-${lecturerId}-courses`)
  updateTag(`course-${courseId}-lecturers`)
}
