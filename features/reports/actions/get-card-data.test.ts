import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCardData } from '@/features/reports/actions/get-card-data'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

describe('getCardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return coursesAtProvadis mapped by lecturer name', async () => {
    vi.mocked(prisma.lecturer.findMany).mockResolvedValue([
      {
        title: 'Dr.',
        firstName: 'Max',
        lastName: 'Mustermann',
        qualifications: [
          { course: { name: 'Mathematik' } },
          { course: { name: 'Informatik' } },
        ],
      },
      {
        title: null,
        firstName: 'Anna',
        lastName: 'Schmidt',
        qualifications: [{ course: { name: 'Physik' } }],
      },
    ] as never)

    const result = await getCardData()

    expect(prisma.lecturer.findMany).toHaveBeenCalledWith({
      select: {
        title: true,
        firstName: true,
        lastName: true,
        qualifications: {
          where: { experience: 'provadis' },
          select: {
            course: {
              select: { name: true },
            },
          },
        },
      },
    })
    expect(result).toEqual({
      coursesAtProvadis: {
        'Dr. Max Mustermann': ['Mathematik', 'Informatik'],
        'Anna Schmidt': ['Physik'],
      },
    })
  })

  it('should return empty object when no lecturers exist', async () => {
    vi.mocked(prisma.lecturer.findMany).mockResolvedValue([])

    const result = await getCardData()

    expect(result).toEqual({
      coursesAtProvadis: {},
    })
  })

  it('should handle lecturers without title correctly', async () => {
    vi.mocked(prisma.lecturer.findMany).mockResolvedValue([
      {
        title: null,
        firstName: 'John',
        lastName: 'Doe',
        qualifications: [{ course: { name: 'BWL' } }],
      },
    ] as never)

    const result = await getCardData()

    expect(result.coursesAtProvadis).toEqual({
      'John Doe': ['BWL'],
    })
  })

  it('should handle lecturers with empty qualifications', async () => {
    vi.mocked(prisma.lecturer.findMany).mockResolvedValue([
      {
        title: 'Prof.',
        firstName: 'Eva',
        lastName: 'Müller',
        qualifications: [],
      },
    ] as never)

    const result = await getCardData()

    expect(result.coursesAtProvadis).toEqual({
      'Prof. Eva Müller': [],
    })
  })

  it('should handle multiple lecturers with multiple courses', async () => {
    vi.mocked(prisma.lecturer.findMany).mockResolvedValue([
      {
        title: 'Dr.',
        firstName: 'A',
        lastName: 'B',
        qualifications: [
          { course: { name: 'Kurs 1' } },
          { course: { name: 'Kurs 2' } },
          { course: { name: 'Kurs 3' } },
        ],
      },
      {
        title: '',
        firstName: 'C',
        lastName: 'D',
        qualifications: [{ course: { name: 'Kurs 4' } }],
      },
    ] as never)

    const result = await getCardData()

    expect(result.coursesAtProvadis['Dr. A B']).toEqual([
      'Kurs 1',
      'Kurs 2',
      'Kurs 3',
    ])
    expect(result.coursesAtProvadis['C D']).toEqual(['Kurs 4'])
  })
})
