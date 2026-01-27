'use server'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteCourse(id: string) {
  return prisma.course.delete({
    where: {
      id,
    },
  })
}
