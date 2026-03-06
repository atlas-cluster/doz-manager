import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteLecturer } from '@/features/lecturers/actions/delete-lecturer'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('deleteLecturer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call prisma.lecturer.delete with correct id', async () => {
    await deleteLecturer('lecturer-123')

    expect(prisma.lecturer.delete).toHaveBeenCalledWith({
      where: { id: 'lecturer-123' },
    })
  })

  it('should invalidate the lecturers cache tag', async () => {
    await deleteLecturer('lecturer-123')

    expect(updateTag).toHaveBeenCalledWith('lecturers')
  })
})
