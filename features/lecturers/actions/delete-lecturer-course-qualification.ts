'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

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
  publishScopeUpdate('lecturers')
  updateTag(`lecturer-${lecturerId}-courses`)
}
