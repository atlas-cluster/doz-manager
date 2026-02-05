'use server'

import { Course } from '@/features/courses/types'
import { Lecturer } from '@/features/lecturers/types'
import { prisma } from '@/features/shared/lib/prisma'

export async function getLecturers(): Promise<Lecturer[]> {
  return prisma.lecturer.findMany({
    orderBy: {
      lastName: 'asc',
    },
  })
}

export async function getCoursesByLecturerId(
  lecturerId: string
): Promise<Course[]> {
  return prisma.course.findMany({
    where: {
      assignments: {
        some: { lecturerId },
      },
    },
    orderBy: { name: 'asc' },
  })
}
