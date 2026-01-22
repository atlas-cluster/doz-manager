'use server'

import { Lecturer } from '@/features/lecturers/types'
import { prisma } from '@/features/shared/lib/prisma'

export async function get(): Promise<Lecturer[]> {
  return prisma.lecturer.findMany({
    orderBy: {
      lastName: 'asc',
    },
  })
}
