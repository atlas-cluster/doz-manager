import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateLecturerQualification } from '@/features/lecturers/actions/update-lecturer-course-qualification'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('updateLecturerQualification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const qualificationData = {
    leadTime: 'four_weeks' as const,
    experience: 'other_uni' as const,
  }

  it('should call prisma.courseQualification.update with correct data', async () => {
    await updateLecturerQualification(
      'lecturer-1',
      'course-1',
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
    await updateLecturerQualification(
      'lecturer-1',
      'course-1',
      qualificationData
    )

    expect(updateTag).toHaveBeenCalledWith('lecturers')
    expect(updateTag).toHaveBeenCalledWith('lecturer-lecturer-1-courses')
  })
})
