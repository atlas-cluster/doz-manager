import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createLecturerCourseAssignment } from '@/features/lecturers/actions/create-lecturer-course-assignment'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('createLecturerCourseAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.courseAssignment.create with correct data', async () => {
    await createLecturerCourseAssignment('lecturer-1', 'course-1')

    expect(prisma.courseAssignment.create).toHaveBeenCalledWith({
      data: {
        courseId: 'course-1',
        lecturerId: 'lecturer-1',
      },
    })
  })

  it('should invalidate the correct cache tags', async () => {
    await createLecturerCourseAssignment('lecturer-1', 'course-1')

    expect(updateTag).toHaveBeenCalledWith('lecturers')
    expect(updateTag).toHaveBeenCalledWith('lecturer-lecturer-1-courses')
    expect(updateTag).not.toHaveBeenCalledWith('courses')
    expect(updateTag).not.toHaveBeenCalledWith('course-course-1-lecturers')
    expect(updateTag).toHaveBeenCalledTimes(2)
  })
})
