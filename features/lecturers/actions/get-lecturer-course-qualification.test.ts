import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getLecturerCourseQualifications } from '@/features/lecturers/actions/get-lecturer-course-qualification'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

describe('getLecturerCourseQualifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query qualifications for the given lecturer', async () => {
    const mockQualifications = [
      {
        lecturerId: 'l1',
        courseId: 'c1',
        leadTime: 'short',
        experience: 'provadis',
      },
    ]
    vi.mocked(prisma.courseQualification.findMany).mockResolvedValue(
      mockQualifications as never
    )

    const result = await getLecturerCourseQualifications('lecturer-1')

    expect(prisma.courseQualification.findMany).toHaveBeenCalledWith({
      where: { lecturerId: 'lecturer-1' },
    })
    expect(result).toEqual(mockQualifications)
  })
})
