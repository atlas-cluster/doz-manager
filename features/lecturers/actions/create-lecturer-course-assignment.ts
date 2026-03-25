'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

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

  updateTag('lecturers')
  publishScopeUpdate('lecturers')
  updateTag('courses')
  publishScopeUpdate('courses')
  updateTag(`lecturer-${lecturerId}-courses`)
  updateTag(`course-${courseId}-lecturers`)
}
