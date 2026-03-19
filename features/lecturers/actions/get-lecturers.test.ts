import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getLecturers } from '@/features/lecturers/actions/get-lecturers'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}))

describe('getLecturers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated lecturers with default params', async () => {
    const mockLecturers = [{ id: 'l1', firstName: 'John', lastName: 'Doe' }]
    vi.mocked(prisma.$transaction).mockResolvedValue([
      1,
      mockLecturers,
      [{ type: 'internal', _count: { type: 1 } }],
      [{ courseLevelPreference: 'both', _count: { courseLevelPreference: 1 } }],
    ])

    const result = await getLecturers({ pageIndex: 0, pageSize: 10 })

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(result).toEqual({
      data: mockLecturers,
      pageCount: 1,
      rowCount: 1,
      facets: {
        type: { internal: 1 },
        courseLevelPreference: { both: 1 },
      },
    })
  })

  it('should calculate pageCount correctly', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([25, [], [], []])

    const result = await getLecturers({ pageIndex: 0, pageSize: 10 })

    expect(result.pageCount).toBe(3)
    expect(result.rowCount).toBe(25)
  })

  it('should apply global filter when provided', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([0, [], [], []])

    await getLecturers({
      pageIndex: 0,
      pageSize: 10,
      globalFilter: 'John',
    })

    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('should apply column filters when provided', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([0, [], [], []])

    await getLecturers({
      pageIndex: 0,
      pageSize: 10,
      columnFilters: [{ id: 'type', value: ['internal'] }],
    })

    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('should apply sorting when provided', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([0, [], [], []])

    await getLecturers({
      pageIndex: 0,
      pageSize: 10,
      sorting: [{ id: 'name', desc: true }],
    })

    expect(prisma.$transaction).toHaveBeenCalled()
  })
})
