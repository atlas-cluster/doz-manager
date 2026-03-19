import { afterEach, describe, expect, it, vi } from 'vitest'

import { columns } from '@/features/courses/components/data-table/columns'
import type { Course } from '@/features/courses/types'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/features/lecturers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/lecturers')>()
  return {
    ...actual,
    getLecturers: vi.fn().mockResolvedValue({
      data: [],
      pageCount: 0,
      rowCount: 0,
      facets: { type: {}, courseLevelPreference: {} },
    }),
  }
})
vi.mock(
  '@/features/courses/actions/get-course-lecturer-qualifications',
  () => ({
    getCourseLecturerQualifications: vi.fn().mockResolvedValue([]),
  })
)
vi.mock(
  '@/features/courses/actions/create-course-lecturer-qualification',
  () => ({
    createCourseLecturerQualification: vi.fn().mockResolvedValue({}),
  })
)
vi.mock(
  '@/features/courses/actions/update-course-lecturer-qualification',
  () => ({
    updateCourseLecturerQualification: vi.fn().mockResolvedValue({}),
  })
)

// ─── helpers ───────────────────────────────────────────────────────────────────

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'c1',
    name: 'Mathematik',
    isOpen: true,
    courseLevel: 'bachelor',
    semester: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function TestTable({ data }: { data: Course[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      createCourse: vi.fn(),
      updateCourse: vi.fn(),
      deleteCourse: vi.fn(),
      deleteCourses: vi.fn(),
      refreshCourses: vi.fn(),
    },
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id}>
                {h.isPlaceholder
                  ? null
                  : flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── tests ─────────────────────────────────────────────────────────────────────

describe('Course columns', () => {
  afterEach(() => {
    cleanup()
  })

  // ── column definitions structure ─────────────────────────────────────────────

  describe('column definitions', () => {
    it('should define the expected column IDs', () => {
      const ids = columns.map(
        (c) => c.id ?? (c as { accessorKey?: string }).accessorKey
      )
      expect(ids).toEqual([
        'select',
        'name',
        'semester',
        'isOpen',
        'courseLevel',
        'assignments',
        'actions',
      ])
    })

    it('should only allow sorting on the name column', () => {
      const sortable = columns.filter((c) => c.enableSorting).map((c) => c.id)
      expect(sortable).toEqual(['name'])
    })

    it('should allow hiding semester, isOpen, courseLevel, and assignments', () => {
      const hideable = columns
        .filter((c) => c.enableHiding)
        .map((c) => c.id ?? (c as { accessorKey?: string }).accessorKey)
      expect(hideable).toEqual([
        'semester',
        'isOpen',
        'courseLevel',
        'assignments',
      ])
    })

    it('should enable global filter only on name', () => {
      const filterable = columns
        .filter((c) => c.enableGlobalFilter)
        .map((c) => c.id ?? (c as { accessorKey?: string }).accessorKey)
      expect(filterable).toEqual(['name'])
    })
  })

  // ── cell rendering ───────────────────────────────────────────────────────────

  describe('cell rendering', () => {
    it('should render course name', () => {
      render(<TestTable data={[makeCourse({ name: 'Physik' })]} />)
      expect(screen.getByText('Physik')).toBeInTheDocument()
    })

    it('should render semester value', () => {
      render(<TestTable data={[makeCourse({ semester: 5 })]} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render "Offen" for open courses', () => {
      render(<TestTable data={[makeCourse({ isOpen: true })]} />)
      // Header "Offen" + cell "Offen"
      expect(screen.getAllByText('Offen').length).toBeGreaterThanOrEqual(1)
    })

    it('should render "Geschlossen" for closed courses', () => {
      render(<TestTable data={[makeCourse({ isOpen: false })]} />)
      expect(screen.getByText('Geschlossen')).toBeInTheDocument()
    })

    it('should render "Bachelor" for bachelor courses', () => {
      render(<TestTable data={[makeCourse({ courseLevel: 'bachelor' })]} />)
      expect(screen.getByText('Bachelor')).toBeInTheDocument()
    })

    it('should render "Master" for master courses', () => {
      render(<TestTable data={[makeCourse({ courseLevel: 'master' })]} />)
      expect(screen.getByText('Master')).toBeInTheDocument()
    })

    it('should render column headers', () => {
      render(<TestTable data={[makeCourse()]} />)
      expect(screen.getByText('Semester')).toBeInTheDocument()
      expect(screen.getByText('Vorlesungsstufe')).toBeInTheDocument()
    })

    it('should render select checkboxes', () => {
      render(<TestTable data={[makeCourse()]} />)
      const checkboxes = screen.getAllByRole('checkbox')
      // Header "Select all" + 1 row "Select row"
      expect(checkboxes.length).toBe(2)
    })
  })

  // ── actions dropdown ─────────────────────────────────────────────────────────

  describe('actions dropdown', () => {
    it('should render actions menu button', () => {
      render(<TestTable data={[makeCourse()]} />)
      expect(
        screen.getByRole('button', { name: 'Menü öffnen' })
      ).toBeInTheDocument()
    })

    it('should show action items when menu is opened', async () => {
      const user = userEvent.setup()
      render(<TestTable data={[makeCourse()]} />)

      await user.click(screen.getByRole('button', { name: 'Menü öffnen' }))

      expect(await screen.findByText('Aktionen')).toBeInTheDocument()
      expect(screen.getByText('Bearbeiten')).toBeInTheDocument()
      expect(screen.getByText('Qualifikationen bearbeiten')).toBeInTheDocument()
      expect(screen.getByText('Löschen')).toBeInTheDocument()
    })
  })
})
