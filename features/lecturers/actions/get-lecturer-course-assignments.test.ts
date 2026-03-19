import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getLecturerCourseAssignments } from '@/features/lecturers/actions/get-lecturer-course-assignments'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

describe('getLecturerCourseAssignments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should query courses assigned to the given lecturer', async () => {
    const mockCourses = [{ id: 'c1', name: 'Mathematik' }]
    vi.mocked(prisma.course.findMany).mockResolvedValue(mockCourses as never)

    const result = await getLecturerCourseAssignments('lecturer-1')

    expect(prisma.course.findMany).toHaveBeenCalledWith({
      where: {
        assignments: {
          some: { lecturerId: 'lecturer-1' },
        },
      },
      orderBy: { name: 'asc' },
    })
    expect(result).toEqual(mockCourses)
  })
})
