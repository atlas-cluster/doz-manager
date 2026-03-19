import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCourse } from '@/features/courses/actions/create-course'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('createCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const courseData = {
    name: 'Mathematik',
    isOpen: true,
    courseLevel: 'bachelor' as const,
    semester: 1,
  }

  it('should call prisma.course.create with correct data', async () => {
    await createCourse(courseData)

    expect(prisma.course.create).toHaveBeenCalledWith({
      data: {
        name: 'Mathematik',
        isOpen: true,
        courseLevel: 'bachelor',
        semester: 1,
      },
    })
  })

  it('should invalidate the courses cache tag', async () => {
    await createCourse(courseData)

    expect(updateTag).toHaveBeenCalledWith('courses')
  })

  it('should handle null semester', async () => {
    const data = { ...courseData, semester: null }
    await createCourse(data)

    expect(prisma.course.create).toHaveBeenCalledWith({
      data: {
        name: 'Mathematik',
        isOpen: true,
        courseLevel: 'bachelor',
        semester: null,
      },
    })
  })
})
