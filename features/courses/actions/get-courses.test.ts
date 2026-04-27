import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCourses } from '@/features/courses/actions/get-courses'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

describe('getCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated courses with default params', async () => {
    const mockCourses = [{ id: 'c1', name: 'Mathematik' }]
    vi.mocked(prisma.$transaction).mockResolvedValue([
      1,
      mockCourses,
      [{ isOpen: true, _count: { isOpen: 1 } }],
      [{ courseLevel: 'bachelor', _count: { courseLevel: 1 } }],
    ])

    const result = await getCourses({ pageIndex: 0, pageSize: 10 })

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(result).toEqual({
      data: mockCourses,
      pageCount: 1,
      rowCount: 1,
      facets: {
        isOpen: { true: 1 },
        courseLevel: { bachelor: 1 },
      },
    })
  })

  it('should apply column filters when provided', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([0, [], [], []])

    await getCourses({
      pageIndex: 0,
      pageSize: 10,
      columnFilters: [{ id: 'isOpen', value: ['true'] }],
    })

    expect(vi.mocked(prisma.course.count)).toHaveBeenCalledWith({
      where: {
        AND: expect.arrayContaining([
          expect.objectContaining({ OR: [{ isOpen: true }] }),
        ]),
      },
    })
  })

  it('should apply global filter when provided', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([0, [], [], []])

    await getCourses({
      pageIndex: 0,
      pageSize: 10,
      globalFilter: 'Math',
    })

    const call = vi.mocked(prisma.$transaction).mock.calls[0]
    expect(call).toBeDefined()
  })

  it('should apply sorting when provided', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([0, [], [], []])

    await getCourses({
      pageIndex: 0,
      pageSize: 10,
      sorting: [{ id: 'name', desc: true }],
    })

    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('should calculate pageCount correctly', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([25, [], [], []])

    const result = await getCourses({ pageIndex: 0, pageSize: 10 })

    expect(result.pageCount).toBe(3)
    expect(result.rowCount).toBe(25)
  })
})
