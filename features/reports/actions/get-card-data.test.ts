import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCardData } from '@/features/reports/actions/get-card-data'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

/**
 * Helper to set up default mocks for all three Prisma queries.
 * Individual tests can override specific mocks as needed.
 */
function mockDefaults() {
  vi.mocked(prisma.lecturer.findMany).mockResolvedValue([])
  vi.mocked(prisma.course.findMany).mockResolvedValue([])
}

describe('getCardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDefaults()
  })

  describe('coursesAtProvadis', () => {
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
        orderBy: {
          lastName: 'asc',
        },
      })
      expect(result.coursesAtProvadis).toEqual({
        'Dr. Max Mustermann': ['Informatik', 'Mathematik'],
        'Anna Schmidt': ['Physik'],
      })
    })

    it('should return empty object when no lecturers exist', async () => {
      const result = await getCardData()

      expect(result.coursesAtProvadis).toEqual({})
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

  describe('coursesWithoutProvadisExperience', () => {
    it('should return course names without provadis experience', async () => {
      vi.mocked(prisma.course.findMany)
        .mockResolvedValueOnce([
          { name: 'Biologie' },
          { name: 'Chemie' },
        ] as never)
        .mockResolvedValueOnce([] as never)

      const result = await getCardData()

      expect(result.coursesWithoutProvadisExperience).toEqual([
        'Biologie',
        'Chemie',
      ])
    })

    it('should return empty array when all courses have provadis experience', async () => {
      const result = await getCardData()

      expect(result.coursesWithoutProvadisExperience).toEqual([])
    })

    it('should query courses with none having provadis experience', async () => {
      vi.mocked(prisma.course.findMany)
        .mockResolvedValueOnce([{ name: 'Kunst' }] as never)
        .mockResolvedValueOnce([] as never)

      await getCardData()

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: {
          qualifications: {
            none: { experience: 'provadis' },
          },
        },
        select: { name: true },
      })
    })
  })

  describe('coursesWithoutLecturer', () => {
    it('should return course names without any lecturer assignment', async () => {
      vi.mocked(prisma.course.findMany)
        .mockResolvedValueOnce([] as never)
        .mockResolvedValueOnce([
          { name: 'Philosophie' },
          { name: 'Geschichte' },
        ] as never)

      const result = await getCardData()

      expect(result.coursesWithoutLecturer).toEqual([
        'Geschichte',
        'Philosophie',
      ])
    })

    it('should return empty array when all courses have lecturers', async () => {
      const result = await getCardData()

      expect(result.coursesWithoutLecturer).toEqual([])
    })

    it('should query courses with no assignments', async () => {
      vi.mocked(prisma.course.findMany)
        .mockResolvedValueOnce([] as never)
        .mockResolvedValueOnce([{ name: 'Musik' }] as never)

      await getCardData()

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: {
          assignments: {
            none: {},
          },
        },
        select: { name: true },
      })
    })
  })

  describe('full card data', () => {
    it('should return all four data sets combined', async () => {
      vi.mocked(prisma.lecturer.findMany)
        .mockResolvedValueOnce([
          {
            title: null,
            firstName: 'Max',
            lastName: 'Meier',
            qualifications: [{ course: { name: 'Mathe' } }],
          },
        ] as never)
        .mockResolvedValueOnce([
          {
            title: null,
            firstName: 'Max',
            lastName: 'Meier',
            qualifications: [{ course: { name: 'Mathe' } }],
          },
        ] as never)
      vi.mocked(prisma.course.findMany)
        .mockResolvedValueOnce([{ name: 'Bio' }] as never)
        .mockResolvedValueOnce([{ name: 'Kunst' }] as never)

      const result = await getCardData()

      expect(result).toEqual({
        coursesAtProvadis: {
          'Max Meier': ['Mathe'],
        },
        coursesAtOtherUni: {
          'Max Meier': ['Mathe'],
        },
        coursesWithoutProvadisExperience: ['Bio'],
        coursesWithoutLecturer: ['Kunst'],
      })
    })
  })
})
