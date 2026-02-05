'use server'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturer(id: string) {
  await prisma.lecturer.delete({
    where: {
      id,
    },
  })
}

export async function removeCourseFromLecturer(
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
