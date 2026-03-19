import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteLecturerCourseAssignment } from '@/features/lecturers/actions/delete-lecturer-course-assignment'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('deleteLecturerCourseAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.courseAssignment.delete with correct compound key', async () => {
    await deleteLecturerCourseAssignment('lecturer-1', 'course-1')

    expect(prisma.courseAssignment.delete).toHaveBeenCalledWith({
      where: {
        lecturerId_courseId: {
          lecturerId: 'lecturer-1',
          courseId: 'course-1',
        },
      },
    })
  })

  it('should invalidate the correct cache tags', async () => {
    await deleteLecturerCourseAssignment('lecturer-1', 'course-1')

    expect(updateTag).toHaveBeenCalledWith('lecturers')
    expect(updateTag).toHaveBeenCalledWith('courses')
    expect(updateTag).toHaveBeenCalledWith('lecturer-lecturer-1-courses')
    expect(updateTag).toHaveBeenCalledWith('course-course-1-lecturers')
  })
})
