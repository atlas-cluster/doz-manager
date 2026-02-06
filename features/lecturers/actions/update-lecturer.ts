'use server'

import { updateTag } from 'next/cache'
import z from 'zod'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { prisma } from '@/features/shared/lib/prisma'

export async function updateLecturer(
  id: string,
  data: z.infer<typeof lecturerSchema>
) {
  await prisma.$transaction(async (tx) => {
    // 1. Update basic lecturer details
    await tx.lecturer.update({
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

    // 2. Sync course assignments
    const currentAssignments = await tx.courseAssignment.findMany({
      where: { lecturerId: id },
      select: { courseId: true },
    })
    const currentCourseIds = currentAssignments.map((a) => a.courseId)

    const coursesToAdd = data.courseIds.filter(
      (cid) => !currentCourseIds.includes(cid)
    )
    const coursesToRemove = currentCourseIds.filter(
      (cid) => !data.courseIds.includes(cid)
    )

    if (coursesToRemove.length > 0) {
      await tx.courseAssignment.deleteMany({
        where: {
          lecturerId: id,
          courseId: { in: coursesToRemove },
        },
      })
    }

    if (coursesToAdd.length > 0) {
      await tx.courseAssignment.createMany({
        data: coursesToAdd.map((cid) => ({
          lecturerId: id,
          courseId: cid,
        })),
      })
    }
  })

  updateTag('lecturers')
}
