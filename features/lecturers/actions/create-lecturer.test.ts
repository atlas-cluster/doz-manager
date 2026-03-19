import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createLecturer } from '@/features/lecturers/actions/create-lecturer'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('createLecturer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const lecturerData = {
    title: 'Dr.',
    firstName: 'John',
    secondName: 'A.',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    type: 'internal' as const,
    courseLevelPreference: 'both' as const,
  }

  it('should call prisma.lecturer.create with correct data', async () => {
    await createLecturer(lecturerData)

    expect(prisma.lecturer.create).toHaveBeenCalledWith({
      data: {
        title: 'Dr.',
        firstName: 'John',
        secondName: 'A.',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        type: 'internal',
        courseLevelPreference: 'both',
      },
    })
  })

  it('should invalidate the lecturers cache tag', async () => {
    await createLecturer(lecturerData)

    expect(updateTag).toHaveBeenCalledWith('lecturers')
  })

  it('should handle null optional fields', async () => {
    const data = { ...lecturerData, title: null, secondName: null }
    await createLecturer(data)

    expect(prisma.lecturer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: null,
        secondName: null,
      }),
    })
  })
})
