'use server'

import z from 'zod'

import { courseAssignmentSchema } from '@/features/lecturers/schemas/qualification'
import { notifyTagsUpdated } from '@/features/shared/lib/cache-notify'
import { runInTransaction } from '@/features/shared/lib/transaction'

export async function upsertCourseAssignment(
  lecturerId: string,
  courseId: string,
  data: z.infer<typeof courseAssignmentSchema>
) {
  const parsed = courseAssignmentSchema.parse(data)

  await runInTransaction(async (tx) =>
    tx.courseAssignment.upsert({
      where: {
        lecturerId_courseId: { lecturerId, courseId },
      },
      create: {
        lecturerId,
        courseId,
        isAssigned: parsed.isAssigned ?? false,
        leadTime: parsed.leadTime ?? null,
        experience: parsed.experience ?? null,
        courseLevelPreference: parsed.courseLevelPreference ?? null,
      },
      update: {
        ...(parsed.isAssigned !== undefined && {
          isAssigned: parsed.isAssigned,
        }),
        ...(parsed.leadTime !== undefined && { leadTime: parsed.leadTime }),
        ...(parsed.experience !== undefined && {
          experience: parsed.experience,
        }),
        ...(parsed.courseLevelPreference !== undefined && {
          courseLevelPreference: parsed.courseLevelPreference,
        }),
      },
    })
  )

  await notifyTagsUpdated(
    [
      'lecturers',
      'courses',
      `lecturer-${lecturerId}-courses`,
      `course-${courseId}-lecturers`,
    ],
    'course-assignments:upsert',
    [
      { entityType: 'lecturer', entityId: lecturerId },
      { entityType: 'course', entityId: courseId },
    ]
  )
}
