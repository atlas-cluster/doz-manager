'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { prisma } from '@/features/shared/lib/prisma'

export async function createLecturer(data: z.infer<typeof lecturerSchema>) {
  await prisma.lecturer.create({
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

  updateTag('lecturers')
}
