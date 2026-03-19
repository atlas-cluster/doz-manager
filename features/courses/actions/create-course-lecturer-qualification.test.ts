import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCourseLecturerQualification } from '@/features/courses/actions/create-course-lecturer-qualification'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('createCourseLecturerQualification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const qualificationData = {
    leadTime: 'short' as const,
    experience: 'provadis' as const,
  }

  it('should call prisma.courseQualification.create with correct data', async () => {
    await createCourseLecturerQualification(
      'course-1',
      'lecturer-1',
      qualificationData
    )

    expect(prisma.courseQualification.create).toHaveBeenCalledWith({
      data: {
        lecturerId: 'lecturer-1',
        courseId: 'course-1',
        leadTime: 'short',
        experience: 'provadis',
      },
    })
  })

  it('should invalidate the correct cache tags', async () => {
    await createCourseLecturerQualification(
      'course-1',
      'lecturer-1',
      qualificationData
    )

    expect(updateTag).toHaveBeenCalledWith('courses')
    expect(updateTag).toHaveBeenCalledWith('course-course-1-lecturers')
  })
})
