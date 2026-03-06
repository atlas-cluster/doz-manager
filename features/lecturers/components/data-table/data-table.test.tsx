import { afterEach, describe, expect, it, vi } from 'vitest'

import { DataTable } from '@/features/lecturers/components/data-table/data-table'
import type { GetLecturersResponse } from '@/features/lecturers/types'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/features/lecturers/actions/create-lecturer', () => ({
  createLecturer: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/lecturers/actions/update-lecturer', () => ({
  updateLecturer: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/lecturers/actions/delete-lecturer', () => ({
  deleteLecturer: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/lecturers/actions/delete-lecturers', () => ({
  deleteLecturers: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/features/lecturers/actions/get-lecturers', () => ({
  getLecturers: vi.fn().mockResolvedValue({
    data: [],
    pageCount: 0,
    rowCount: 0,
    facets: { type: {}, courseLevelPreference: {} },
  }),
}))
vi.mock('@/features/lecturers/actions/get-lecturer-course-assignments', () => ({
  getLecturerCourseAssignments: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/features/courses', () => ({
  getCourses: vi
    .fn()
    .mockResolvedValue({ data: [], pageCount: 0, rowCount: 0 }),
  Course: {},
}))

const emptyData: GetLecturersResponse = {
  data: [],
  pageCount: 0,
  rowCount: 0,
  facets: { type: {}, courseLevelPreference: {} },
}

const sampleData: GetLecturersResponse = {
  data: [
    {
      id: 'l1',
      title: 'Dr.',
      firstName: 'John',
      secondName: null,
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      type: 'internal',
      courseLevelPreference: 'both',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 'l2',
      title: null,
      firstName: 'Jane',
      secondName: 'M.',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+9876543210',
      type: 'external',
      courseLevelPreference: 'master',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  ],
  pageCount: 1,
  rowCount: 2,
  facets: {
    type: { internal: 1, external: 1 },
    courseLevelPreference: { both: 1, master: 1 },
  },
}

describe('Lecturers DataTable', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the empty state when no data is provided', () => {
    render(<DataTable initialData={emptyData} />)
    expect(screen.getByText('Keine Dozenten gefunden.')).toBeInTheDocument()
  })

  it('should render lecturer rows when data is provided', () => {
    render(<DataTable initialData={sampleData} />)
    expect(screen.getByText(/John/)).toBeInTheDocument()
    expect(screen.getByText(/Jane/)).toBeInTheDocument()
  })

  it('should render the search input', () => {
    render(<DataTable initialData={sampleData} />)
    expect(
      screen.getAllByPlaceholderText('Dozenten suchen...').length
    ).toBeGreaterThan(0)
  })

  it('should render the create button', () => {
    render(<DataTable initialData={sampleData} />)
    expect(screen.getByText('Dozent erstellen')).toBeInTheDocument()
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
    expect(screen.getByText('E-Mail')).toBeInTheDocument()
  })

  it('should render type column values', () => {
    render(<DataTable initialData={sampleData} />)
    expect(screen.getByText('Intern')).toBeInTheDocument()
    expect(screen.getByText('Extern')).toBeInTheDocument()
  })

  it('should render pagination', () => {
    render(<DataTable initialData={sampleData} />)
    expect(screen.getByText(/Seite 1 von/)).toBeInTheDocument()
  })

  it('should render row selection checkboxes', () => {
    render(<DataTable initialData={sampleData} />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(3)
  })

  it('should render faceted filters', () => {
    render(<DataTable initialData={sampleData} />)
    expect(screen.getByRole('button', { name: /Typ/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Präferenz/i })
    ).toBeInTheDocument()
  })

  it('should open create dialog when create button is clicked', async () => {
    const user = userEvent.setup()
    render(<DataTable initialData={sampleData} />)
    await user.click(screen.getByText('Dozent erstellen'))
    expect(
      await screen.findByText('Dozent erstellen', { selector: 'h2' })
    ).toBeInTheDocument()
  })
})
