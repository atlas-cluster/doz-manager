'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

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
  publishScopeUpdate('lecturers')
  updateTag('courses')
  publishScopeUpdate('courses')
  updateTag(`lecturer-${lecturerId}-courses`)
  updateTag(`course-${courseId}-lecturers`)
}
