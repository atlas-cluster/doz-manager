'use server'

import { revalidateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'

export async function deleteCourse(id: string) {
  await prisma.course.delete({
    where: {
      id,
    },
  })

  revalidateTag('courses', {})
}
