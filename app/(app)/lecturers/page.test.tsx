import { test, vi } from 'vitest'

import LecturersPage from '@/app/(app)/lecturers/page'
import { prisma } from '@/features/shared/lib/prisma'
import { render } from '@testing-library/react'

// Mock Prisma
vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    lecturer: {
      findMany: vi.fn(),
    },
  },
}))

test('LecturersPage renders', async () => {
  vi.mocked(prisma.lecturer.findMany).mockResolvedValue([])

  const Page = await LecturersPage()
  render(Page)
})
