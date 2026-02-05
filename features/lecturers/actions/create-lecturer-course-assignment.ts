'use server'

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
}
