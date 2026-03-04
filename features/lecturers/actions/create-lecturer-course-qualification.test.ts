import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createLecturerQualification } from '@/features/lecturers/actions/create-lecturer-course-qualification'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('createLecturerQualification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const qualificationData = {
    leadTime: 'short' as const,
    experience: 'provadis' as const,
  }

  it('should call prisma.courseQualification.create with correct data', async () => {
    await createLecturerQualification(
      'lecturer-1',
      'course-1',
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
    await createLecturerQualification(
      'lecturer-1',
      'course-1',
      qualificationData
    )

    expect(updateTag).toHaveBeenCalledWith('lecturers')
    expect(updateTag).toHaveBeenCalledWith('lecturer-lecturer-1-courses')
  })
})
