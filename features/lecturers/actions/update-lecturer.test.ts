import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateLecturer } from '@/features/lecturers/actions/update-lecturer'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('updateLecturer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const lecturerData = {
    title: 'Prof.',
    firstName: 'Jane',
    secondName: null,
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+9876543210',
    type: 'external' as const,
    courseLevelPreference: 'master' as const,
  }

  it('should call prisma.lecturer.update with correct id and data', async () => {
    await updateLecturer('lecturer-123', lecturerData)

    expect(prisma.lecturer.update).toHaveBeenCalledWith({
      where: { id: 'lecturer-123' },
      data: {
        title: 'Prof.',
        firstName: 'Jane',
        secondName: null,
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+9876543210',
        type: 'external',
        courseLevelPreference: 'master',
      },
    })
  })

  it('should invalidate the lecturers cache tag', async () => {
    await updateLecturer('lecturer-123', lecturerData)

    expect(updateTag).toHaveBeenCalledWith('lecturers')
  })
})
