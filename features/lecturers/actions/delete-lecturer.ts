'use server'

import { updateTag } from 'next/cache'

import { prisma } from '@/features/shared/lib/prisma'
import { publishScopeUpdate } from '@/features/shared/lib/update-stream'

export async function deleteLecturer(id: string) {
  await prisma.lecturer.delete({
    where: {
      id,
    },
  })

  updateTag('lecturers')
  publishScopeUpdate('lecturers')
}
