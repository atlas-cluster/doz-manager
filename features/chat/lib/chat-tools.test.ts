import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  executeChatTool,
  getVisibleFeatures,
} from '@/features/chat/lib/chat-tools'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    lecturer: {
      findMany: vi.fn(),
    },
    course: {
      findMany: vi.fn(),
    },
    courseAssignment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    courseQualification: {
      findMany: vi.fn(),
    },
  },
}))

describe('chat tools feature visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only non-admin features for regular users', () => {
    const features = getVisibleFeatures(false)

    expect(features.some((feature) => feature.key === 'access-control')).toBe(
      false
    )
  })

  it('includes admin feature for admins', () => {
    const features = getVisibleFeatures(true)

    expect(features.some((feature) => feature.key === 'access-control')).toBe(
      true
    )
  })

  it('resolves lecturers even when the middle name is omitted', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)
    vi.mocked(prisma.lecturer.findMany).mockResolvedValue([
      {
        id: 'lect-1',
        title: 'Prof.',
        firstName: 'Max',
        secondName: 'Karl',
        lastName: 'Mustermann',
        email: 'max@example.com',
        phone: '123',
        type: 'internal',
        courseLevelPreference: 'both',
      },
    ] as never)

    const result = await executeChatTool(
      {
        name: 'find_lecturer',
        arguments: {
          lecturerName: 'Max Mustermann',
        },
      },
      'user-1'
    )

    expect(result).toMatchObject({
      lecturer: {
        id: 'lect-1',
        displayName: 'Prof. Max Karl Mustermann',
      },
    })
  })

  it('allows non-admin users to assign lecturers to courses', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)
    vi.mocked(prisma.lecturer.findMany).mockResolvedValue([
      {
        id: 'lect-1',
        title: 'Prof.',
        firstName: 'Max',
        secondName: 'Karl',
        lastName: 'Mustermann',
        email: 'max@example.com',
        phone: '123',
        type: 'internal',
        courseLevelPreference: 'both',
      },
    ] as never)
    vi.mocked(prisma.course.findMany).mockResolvedValue([
      {
        id: 'course-1',
        name: 'Mathematik 1',
        courseLevel: 'bachelor',
        isOpen: true,
        semester: 1,
      },
    ] as never)
    vi.mocked(prisma.courseAssignment.findUnique).mockResolvedValue(
      null as never
    )

    const result = await executeChatTool(
      {
        name: 'assign_lecturer_to_course',
        arguments: {
          lecturerName: 'Max Mustermann',
          courseName: 'Mathematik 1',
        },
      },
      'user-1'
    )

    expect(prisma.courseAssignment.create).toHaveBeenCalledWith({
      data: {
        lecturerId: 'lect-1',
        courseId: 'course-1',
      },
    })
    expect(result).toMatchObject({
      success: true,
      lecturer: {
        id: 'lect-1',
      },
      course: {
        id: 'course-1',
      },
    })
  })
})
