'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteLecturerCourseQualification(
  lecturerId: string,
  courseId: string
) {
  await prisma.courseQualification.delete({
    where: {
      lecturerId_courseId: {
        lecturerId: lecturerId,
        courseId: courseId,
      },
    },
  })

  updateTag('lecturers')
  updateTag(`lecturer-${lecturerId}-courses`)
}
