import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteLecturerCourseQualification } from '@/features/lecturers/actions/delete-lecturer-course-qualification'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('deleteLecturerCourseQualification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.courseQualification.delete with correct compound key', async () => {
    await deleteLecturerCourseQualification('lecturer-1', 'course-1')

    expect(prisma.courseQualification.delete).toHaveBeenCalledWith({
      where: {
        lecturerId_courseId: {
          lecturerId: 'lecturer-1',
          courseId: 'course-1',
        },
      },
    })
  })

  it('should invalidate the correct cache tags', async () => {
    await deleteLecturerCourseQualification('lecturer-1', 'course-1')

    expect(updateTag).toHaveBeenCalledWith('lecturers')
    expect(updateTag).toHaveBeenCalledWith('lecturer-lecturer-1-courses')
  })
})
