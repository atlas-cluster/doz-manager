import { afterEach, describe, expect, it, vi } from 'vitest'

import { DataTable } from '@/features/courses/components/data-table/data-table'
import type { GetCoursesResponse } from '@/features/courses/types'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/features/courses/actions/create-course', () => ({
  createCourse: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/courses/actions/update-course', () => ({
  updateCourse: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/courses/actions/delete-course', () => ({
  deleteCourse: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/courses/actions/delete-courses', () => ({
  deleteCourses: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/courses/actions/get-courses', () => ({
  getCourses: vi.fn().mockResolvedValue({
    data: [],
    pageCount: 0,
    rowCount: 0,
    facets: { isOpen: {}, courseLevel: {} },
  }),
}))

const emptyData: GetCoursesResponse = {
  data: [],
  pageCount: 0,
  rowCount: 0,
  facets: { isOpen: {}, courseLevel: {} },
}

const sampleData: GetCoursesResponse = {
  data: [
    {
      id: 'c1',
      name: 'Mathematik',
      isOpen: true,
      courseLevel: 'bachelor',
      semester: 3,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 'c2',
      name: 'Physik',
      isOpen: false,
      courseLevel: 'master',
      semester: 1,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  ],
  pageCount: 1,
  rowCount: 2,
  facets: {
    isOpen: { true: 1, false: 1 },
    courseLevel: { bachelor: 1, master: 1 },
  },
}

describe('Courses DataTable', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the empty state when no data is provided', () => {
    render(<DataTable initialData={emptyData} />)

    expect(screen.getByText('Keine Vorlesungen gefunden.')).toBeInTheDocument()
  })

  it('should render course rows when data is provided', () => {
    render(<DataTable initialData={sampleData} />)

    expect(screen.getByText('Mathematik')).toBeInTheDocument()
    expect(screen.getByText('Physik')).toBeInTheDocument()
  })

  it('should render the search input', () => {
    render(<DataTable initialData={sampleData} />)

    expect(
      screen.getAllByPlaceholderText('Vorlesungen suchen...').length
    ).toBeGreaterThan(0)
  })

  it('should render the create button', () => {
    render(<DataTable initialData={sampleData} />)

    // Both mobile (sr-only) and desktop versions exist
    expect(
      screen.getAllByText('Vorlesung erstellen').length
    ).toBeGreaterThanOrEqual(1)
  })

  it('should render the refresh button', () => {
    render(<DataTable initialData={sampleData} />)

    expect(
      screen.getAllByRole('button', { name: 'Daten aktualisieren' }).length
    ).toBeGreaterThan(0)
  })

  it('should render column headers', () => {
    render(<DataTable initialData={sampleData} />)

    expect(screen.getByRole('button', { name: /Name/ })).toBeInTheDocument()
    expect(screen.getByText('Semester')).toBeInTheDocument()
  })

  it('should render open/closed status', () => {
    render(<DataTable initialData={sampleData} />)

    // Column header "Offen" + cell value "Offen"
    expect(screen.getAllByText('Offen').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Geschlossen')).toBeInTheDocument()
  })

  it('should render course level', () => {
    render(<DataTable initialData={sampleData} />)

    expect(screen.getByText('Bachelor')).toBeInTheDocument()
    expect(screen.getByText('Master')).toBeInTheDocument()
  })

  it('should render pagination', () => {
    render(<DataTable initialData={sampleData} />)

    expect(screen.getByText(/Seite 1 von/)).toBeInTheDocument()
  })

  it('should render row selection checkboxes', () => {
    render(<DataTable initialData={sampleData} />)

    const checkboxes = screen.getAllByRole('checkbox')
    // Header select-all + 2 rows
    expect(checkboxes.length).toBe(3)
  })

  it('should render faceted filters', () => {
    render(<DataTable initialData={sampleData} />)
    expect(screen.getByRole('button', { name: /Offen/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Vorlesungsstufe/i })
    ).toBeInTheDocument()
  })

  it('should open create dialog when create button is clicked', async () => {
    const user = userEvent.setup()
    render(<DataTable initialData={sampleData} />)

    // Click the visible desktop "Vorlesung erstellen" button
    const buttons = screen.getAllByText('Vorlesung erstellen')
    await user.click(buttons[buttons.length - 1])

    expect(
      await screen.findByText(/Hier können Sie eine neue Vorlesung anlegen/)
    ).toBeInTheDocument()
  })
})
