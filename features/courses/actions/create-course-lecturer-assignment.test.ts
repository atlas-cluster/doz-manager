import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCourseLecturerAssignment } from '@/features/courses/actions/create-course-lecturer-assignment'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('createCourseLecturerAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.courseAssignment.create with correct data', async () => {
    await createCourseLecturerAssignment('course-1', 'lecturer-1')

    expect(prisma.courseAssignment.create).toHaveBeenCalledWith({
      data: {
        courseId: 'course-1',
        lecturerId: 'lecturer-1',
      },
    })
  })

  it('should invalidate the correct cache tags', async () => {
    await createCourseLecturerAssignment('course-1', 'lecturer-1')

    expect(updateTag).toHaveBeenCalledWith('courses')
    expect(updateTag).toHaveBeenCalledWith('course-course-1-lecturers')
  })
})
