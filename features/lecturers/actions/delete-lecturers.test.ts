import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteLecturers } from '@/features/lecturers/actions/delete-lecturers'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('deleteLecturers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.lecturer.deleteMany with correct ids', async () => {
    const ids = ['l-1', 'l-2', 'l-3']
    await deleteLecturers(ids)

    expect(prisma.lecturer.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ids } },
    })
  })

  it('should invalidate the lecturers cache tag', async () => {
    await deleteLecturers(['l-1'])

    expect(updateTag).toHaveBeenCalledWith('lecturers')
  })

  it('should handle empty array', async () => {
    await deleteLecturers([])

    expect(prisma.lecturer.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [] } },
    })
  })
})
