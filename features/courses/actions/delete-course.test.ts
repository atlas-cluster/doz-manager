import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteCourse } from '@/features/courses/actions/delete-course'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('deleteCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.course.delete with correct id', async () => {
    await deleteCourse('course-123')

    expect(prisma.course.delete).toHaveBeenCalledWith({
      where: { id: 'course-123' },
    })
  })

  it('should invalidate the courses cache tag', async () => {
    await deleteCourse('course-123')

    expect(updateTag).toHaveBeenCalledWith('courses')
  })
})
