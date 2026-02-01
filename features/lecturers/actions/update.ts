'use server'

import { revalidateTag } from 'next/cache'
import z from 'zod'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { prisma } from '@/features/shared/lib/prisma'

export async function updateLecturer(
  id: string,
  data: z.infer<typeof lecturerSchema>
) {
  await prisma.lecturer.update({
    where: {
      id: id,
    },
    data: {
      title: data.title,
      firstName: data.firstName,
      secondName: data.secondName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      type: data.type,
      courseLevelPreference: data.courseLevelPreference,
    },
  })

  revalidateTag('lecturers', '')
}
