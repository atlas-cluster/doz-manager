'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

export async function createCourseLecturerAssignment(
  courseId: string,
  lecturerId: string
) {
  await prisma.courseAssignment.create({
    data: {
      courseId: courseId,
      lecturerId: lecturerId,
    },
  })

  updateTag('courses')
  publishScopeUpdate('courses')
  updateTag(`course-${courseId}-lecturers`)
}
