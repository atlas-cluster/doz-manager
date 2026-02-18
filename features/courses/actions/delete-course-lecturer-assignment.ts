'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

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
  updateTag(`course-${courseId}-lecturers`)
}
