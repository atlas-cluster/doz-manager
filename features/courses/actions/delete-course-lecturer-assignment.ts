'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

export async function deleteCourseLecturerAssignment(
  courseId: string,
  lecturerId: string
) {
  await prisma.courseAssignment.delete({
    where: {
      lecturerId_courseId: {
        lecturerId,
        courseId,
      },
    },
  })

  updateTag('courses')
  publishScopeUpdate('courses')
  updateTag(`course-${courseId}-lecturers`)
}
