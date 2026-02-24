'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

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
  updateTag(`course-${courseId}-lecturers`)
}
