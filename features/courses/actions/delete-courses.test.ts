import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteCourses } from '@/features/courses/actions/delete-courses'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('deleteCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.course.deleteMany with correct ids', async () => {
    const ids = ['course-1', 'course-2', 'course-3']
    await deleteCourses(ids)

    expect(prisma.course.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ids } },
    })
  })

  it('should invalidate the courses cache tag', async () => {
    await deleteCourses(['course-1'])

    expect(updateTag).toHaveBeenCalledWith('courses')
  })

  it('should handle empty array', async () => {
    await deleteCourses([])

    expect(prisma.course.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [] } },
    })
  })
})
