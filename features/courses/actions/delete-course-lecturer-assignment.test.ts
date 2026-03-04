import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteCourseLecturerAssignment } from '@/features/courses/actions/delete-course-lecturer-assignment'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('deleteCourseLecturerAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.courseAssignment.delete with correct compound key', async () => {
    await deleteCourseLecturerAssignment('course-1', 'lecturer-1')

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
    await deleteCourseLecturerAssignment('course-1', 'lecturer-1')

    expect(updateTag).toHaveBeenCalledWith('courses')
    expect(updateTag).toHaveBeenCalledWith('course-course-1-lecturers')
  })
})
