import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCourseLecturerAssignments } from '@/features/courses/actions/get-course-lecturer-assignments'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

describe('getCourseLecturerAssignments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query lecturers assigned to the given course', async () => {
    const mockLecturers = [{ id: 'l1', firstName: 'John', lastName: 'Doe' }]
    vi.mocked(prisma.lecturer.findMany).mockResolvedValue(
      mockLecturers as never
    )

    const result = await getCourseLecturerAssignments('course-1')

    expect(prisma.lecturer.findMany).toHaveBeenCalledWith({
      where: {
        assignments: {
          some: { courseId: 'course-1' },
        },
      },
      orderBy: { lastName: 'asc' },
    })
    expect(result).toEqual(mockLecturers)
  })
})
