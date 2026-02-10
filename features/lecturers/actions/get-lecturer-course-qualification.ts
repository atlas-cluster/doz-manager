'use server'

import { unstable_cache } from 'next/cache'

import { CourseQualification } from '@/features/courses'
import { prisma } from '@/features/shared/lib/prisma'

async function getLecturerCourseQualificationsInternal(
  lecturerId: string
): Promise<CourseQualification[]> {
  return prisma.courseQualification.findMany({
    where: {
      lecturerId: lecturerId,
    },
  })
}

export async function getLecturerCourseQualifications(
  lecturerId: string
): Promise<CourseQualification[]> {
  return unstable_cache(
    async () => getLecturerCourseQualificationsInternal(lecturerId),
    ['lecturer-courses-get', lecturerId],
    {
      tags: ['lecturers', 'courses', `lecturer-${lecturerId}-courses`],
      revalidate: 3600,
    }
  )()
}
