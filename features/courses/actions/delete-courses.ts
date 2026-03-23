'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

export async function deleteCourses(ids: string[]) {
  await prisma.course.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  updateTag('courses')
  publishScopeUpdate('courses')
}
