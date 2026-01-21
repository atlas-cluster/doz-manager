import { expect, test, vi } from 'vitest'

import LecturersPage from '@/app/(app)/lecturers/page'
import { prisma } from '@/features/shared/lib/prisma'
import { render, screen } from '@testing-library/react'

// Mock Prisma
vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    lecturer: {
      findMany: vi.fn(),
    },
  },
}))

// Mock Feature Components to skip rendering children
vi.mock('@/features/lecturers', () => ({
  CreateLecturerDialog: () => <div data-testid="create-dialog" />,
  LecturerDataTable: () => <div data-testid="data-table" />,
  lecturerColumns: [],
}))

test('LecturersPage renders main components', async () => {
  vi.mocked(prisma.lecturer.findMany).mockResolvedValue([])

  const Page = await LecturersPage()
  render(Page)

  expect(screen.getByTestId('create-dialog')).toBeDefined()
  expect(screen.getByTestId('data-table')).toBeDefined()
})
