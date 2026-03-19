import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateCourse } from '@/features/courses/actions/update-course'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('updateCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const courseData = {
    name: 'Physik',
    isOpen: false,
    courseLevel: 'master' as const,
    semester: 3,
  }

  it('should call prisma.course.update with correct id and data', async () => {
    await updateCourse('course-123', courseData)

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: 'course-123' },
      data: {
        name: 'Physik',
        isOpen: false,
        courseLevel: 'master',
        semester: 3,
      },
    })
  })

  it('should invalidate the courses cache tag', async () => {
    await updateCourse('course-123', courseData)

    expect(updateTag).toHaveBeenCalledWith('courses')
  })
})
