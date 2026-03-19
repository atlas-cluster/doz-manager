import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateCourseLecturerQualification } from '@/features/courses/actions/update-course-lecturer-qualification'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('updateCourseLecturerQualification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const qualificationData = {
    leadTime: 'four_weeks' as const,
    experience: 'other_uni' as const,
  }

  it('should call prisma.courseQualification.update with correct data', async () => {
    await updateCourseLecturerQualification(
      'course-1',
      'lecturer-1',
      qualificationData
    )

    expect(prisma.courseQualification.update).toHaveBeenCalledWith({
      where: {
        lecturerId_courseId: {
          lecturerId: 'lecturer-1',
          courseId: 'course-1',
        },
      },
      data: {
        leadTime: 'four_weeks',
        experience: 'other_uni',
      },
    })
  })

  it('should invalidate the correct cache tags', async () => {
    await updateCourseLecturerQualification(
      'course-1',
      'lecturer-1',
      qualificationData
    )

    expect(updateTag).toHaveBeenCalledWith('courses')
    expect(updateTag).toHaveBeenCalledWith('course-course-1-lecturers')
  })
})
