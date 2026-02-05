'use server'

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
}
