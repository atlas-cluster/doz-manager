import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCourseLecturerQualifications } from '@/features/courses/actions/get-course-lecturer-qualifications'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

describe('getCourseLecturerQualifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query qualifications for the given course', async () => {
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

    const result = await getCourseLecturerQualifications('course-1')

    expect(prisma.courseQualification.findMany).toHaveBeenCalledWith({
      where: { courseId: 'course-1' },
    })
    expect(result).toEqual(mockQualifications)
  })
})
