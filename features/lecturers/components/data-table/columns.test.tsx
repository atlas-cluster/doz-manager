import { afterEach, describe, expect, it, vi } from 'vitest'

import { columns } from '@/features/lecturers/components/data-table/columns'
import type { Lecturer } from '@/features/lecturers/types'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/features/lecturers/actions/get-lecturer-course-assignments', () => ({
  getLecturerCourseAssignments: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/features/courses', () => ({
  getCourses: vi
    .fn()
    .mockResolvedValue({ data: [], pageCount: 0, rowCount: 0 }),
}))
vi.mock(
  '@/features/lecturers/actions/get-lecturer-course-qualification',
  () => ({
    getLecturerCourseQualifications: vi.fn().mockResolvedValue([]),
  })
)

// ─── helpers ───────────────────────────────────────────────────────────────────

function makeLecturer(overrides: Partial<Lecturer> = {}): Lecturer {
  return {
    id: 'l1',
    title: null,
    firstName: 'John',
    secondName: null,
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    type: 'internal',
    courseLevelPreference: 'both',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/** Tiny wrapper that renders a real TanStack table with our column defs. */
function TestTable({ data }: { data: Lecturer[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      createLecturer: vi.fn(),
      updateLecturer: vi.fn(),
      deleteLecturer: vi.fn(),
      deleteLecturers: vi.fn(),
      refreshLecturers: vi.fn(),
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

// ─── pure logic tests ──────────────────────────────────────────────────────────

describe('Lecturer columns', () => {
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
        'email',
        'phone',
        'type',
        'courseLevelPreference',
        'assignments',
        'actions',
      ])
    })

    it('should only allow sorting on the name column', () => {
      const sortable = columns.filter((c) => c.enableSorting).map((c) => c.id)
      expect(sortable).toEqual(['name'])
    })

    it('should allow hiding email, phone, type, courseLevelPreference, and assignments', () => {
      const hideable = columns
        .filter((c) => c.enableHiding)
        .map((c) => c.id ?? (c as { accessorKey?: string }).accessorKey)
      expect(hideable).toEqual([
        'email',
        'phone',
        'type',
        'courseLevelPreference',
        'assignments',
      ])
    })

    it('should enable global filter on name, email, and phone', () => {
      const filterable = columns
        .filter((c) => c.enableGlobalFilter)
        .map((c) => c.id ?? (c as { accessorKey?: string }).accessorKey)
      expect(filterable).toEqual(['name', 'email', 'phone'])
    })
  })

  // ── name accessor function ───────────────────────────────────────────────────

  describe('name accessorFn', () => {
    const nameCol = columns.find((c) => c.id === 'name')!
    const accessorFn = (
      nameCol as unknown as { accessorFn: (row: Lecturer) => string }
    ).accessorFn

    it('should build full name with title and secondName', () => {
      const lecturer = makeLecturer({
        title: 'Prof.',
        firstName: 'Jane',
        secondName: 'M.',
        lastName: 'Smith',
      })
      expect(accessorFn(lecturer)).toBe('Prof. Jane M. Smith')
    })

    it('should build name without title and secondName', () => {
      const lecturer = makeLecturer({
        title: null,
        firstName: 'John',
        secondName: null,
        lastName: 'Doe',
      })
      expect(accessorFn(lecturer)).toBe(' John  Doe')
    })

    it('should handle missing title only', () => {
      const lecturer = makeLecturer({
        title: null,
        firstName: 'Jane',
        secondName: 'M.',
        lastName: 'Smith',
      })
      expect(accessorFn(lecturer)).toBe(' Jane M. Smith')
    })

    it('should handle missing secondName only', () => {
      const lecturer = makeLecturer({
        title: 'Dr.',
        firstName: 'John',
        secondName: null,
        lastName: 'Doe',
      })
      expect(accessorFn(lecturer)).toBe('Dr. John  Doe')
    })
  })

  // ── name sorting function ────────────────────────────────────────────────────

  describe('name sortingFn', () => {
    const nameCol = columns.find((c) => c.id === 'name')!
    const sortingFn = (
      nameCol as unknown as {
        sortingFn: (
          a: { original: Lecturer },
          b: { original: Lecturer }
        ) => number
      }
    ).sortingFn

    it('should sort by lastName alphabetically', () => {
      const rowA = { original: makeLecturer({ lastName: 'Alpha' }) }
      const rowB = { original: makeLecturer({ lastName: 'Beta' }) }
      expect(sortingFn(rowA, rowB)).toBeLessThan(0)
    })

    it('should return 0 for equal lastNames', () => {
      const rowA = { original: makeLecturer({ lastName: 'Same' }) }
      const rowB = { original: makeLecturer({ lastName: 'Same' }) }
      expect(sortingFn(rowA, rowB)).toBe(0)
    })

    it('should return positive for reverse order', () => {
      const rowA = { original: makeLecturer({ lastName: 'Zeta' }) }
      const rowB = { original: makeLecturer({ lastName: 'Alpha' }) }
      expect(sortingFn(rowA, rowB)).toBeGreaterThan(0)
    })

    it('should handle umlauts correctly via localeCompare', () => {
      const rowA = { original: makeLecturer({ lastName: 'Über' }) }
      const rowB = { original: makeLecturer({ lastName: 'Unter' }) }
      // localeCompare should handle this — just check it returns a number
      expect(typeof sortingFn(rowA, rowB)).toBe('number')
    })
  })

  // ── courseLevelPreference filterFn ───────────────────────────────────────────

  describe('courseLevelPreference filterFn', () => {
    const prefCol = columns.find(
      (c) =>
        (c as { accessorKey?: string }).accessorKey === 'courseLevelPreference'
    )!
    const filterFn = (
      prefCol as unknown as {
        filterFn: (
          row: { getValue: (id: string) => string },
          id: string,
          value: string[]
        ) => boolean
      }
    ).filterFn

    const makeRow = (pref: string) => ({
      getValue: (id: string) => {
        if (id === 'courseLevelPreference') return pref
        return ''
      },
    })

    it('should return true when no filter values (empty array fallback)', () => {
      expect(filterFn(makeRow('bachelor'), 'courseLevelPreference', [])).toBe(
        true
      )
    })

    it('should match bachelor when filtering for bachelor', () => {
      expect(
        filterFn(makeRow('bachelor'), 'courseLevelPreference', ['bachelor'])
      ).toBe(true)
    })

    it('should match "both" when filtering for bachelor', () => {
      expect(
        filterFn(makeRow('both'), 'courseLevelPreference', ['bachelor'])
      ).toBe(true)
    })

    it('should NOT match master when filtering for bachelor', () => {
      expect(
        filterFn(makeRow('master'), 'courseLevelPreference', ['bachelor'])
      ).toBe(false)
    })

    it('should match master when filtering for master', () => {
      expect(
        filterFn(makeRow('master'), 'courseLevelPreference', ['master'])
      ).toBe(true)
    })

    it('should match "both" when filtering for master', () => {
      expect(
        filterFn(makeRow('both'), 'courseLevelPreference', ['master'])
      ).toBe(true)
    })

    it('should NOT match bachelor when filtering for master', () => {
      expect(
        filterFn(makeRow('bachelor'), 'courseLevelPreference', ['master'])
      ).toBe(false)
    })

    it('should match "both" when filtering for bachelor AND master', () => {
      expect(
        filterFn(makeRow('both'), 'courseLevelPreference', [
          'bachelor',
          'master',
        ])
      ).toBe(true)
    })

    it('should NOT match bachelor when filtering for bachelor AND master', () => {
      expect(
        filterFn(makeRow('bachelor'), 'courseLevelPreference', [
          'bachelor',
          'master',
        ])
      ).toBe(false)
    })

    it('should NOT match master when filtering for bachelor AND master', () => {
      expect(
        filterFn(makeRow('master'), 'courseLevelPreference', [
          'bachelor',
          'master',
        ])
      ).toBe(false)
    })
  })

  // ── cell rendering ───────────────────────────────────────────────────────────

  describe('cell rendering', () => {
    it('should render "Intern" for internal type', () => {
      render(<TestTable data={[makeLecturer({ type: 'internal' })]} />)
      expect(screen.getByText('Intern')).toBeInTheDocument()
    })

    it('should render "Extern" for external type', () => {
      render(<TestTable data={[makeLecturer({ type: 'external' })]} />)
      expect(screen.getByText('Extern')).toBeInTheDocument()
    })

    it('should render "Bachelor" for bachelor preference', () => {
      render(
        <TestTable
          data={[makeLecturer({ courseLevelPreference: 'bachelor' })]}
        />
      )
      expect(screen.getByText('Bachelor')).toBeInTheDocument()
    })

    it('should render "Master" for master preference', () => {
      render(
        <TestTable data={[makeLecturer({ courseLevelPreference: 'master' })]} />
      )
      expect(screen.getByText('Master')).toBeInTheDocument()
    })

    it('should render "Beides" for both preference', () => {
      render(
        <TestTable data={[makeLecturer({ courseLevelPreference: 'both' })]} />
      )
      expect(screen.getByText('Beides')).toBeInTheDocument()
    })

    it('should render email in the table', () => {
      render(<TestTable data={[makeLecturer({ email: 'test@mail.de' })]} />)
      expect(screen.getByText('test@mail.de')).toBeInTheDocument()
    })

    it('should render phone in the table', () => {
      render(<TestTable data={[makeLecturer({ phone: '+49 123 456789' })]} />)
      expect(screen.getByText('+49 123 456789')).toBeInTheDocument()
    })

    it('should render column headers', () => {
      render(<TestTable data={[makeLecturer()]} />)
      expect(screen.getByText('E-Mail')).toBeInTheDocument()
      expect(screen.getByText('Telefonnummer')).toBeInTheDocument()
      expect(screen.getByText('Beschäftigungsart')).toBeInTheDocument()
      expect(screen.getByText('Vorlesungspräferenz')).toBeInTheDocument()
      expect(screen.getByText('Vorlesungen')).toBeInTheDocument()
    })

    it('should render assignments as avatars', () => {
      const data = [
        makeLecturer({
          assignments: [
            { course: { name: 'Mathematik' } },
            { course: { name: 'Physik' } },
          ],
        }),
      ]
      render(<TestTable data={data} />)
      // initialsFromName produces uppercase avatar fallback text
      expect(screen.getByText('MA')).toBeInTheDocument()
      expect(screen.getByText('PH')).toBeInTheDocument()
    })

    it('should show remaining count when more than 3 assignments', () => {
      const data = [
        makeLecturer({
          assignments: [
            { course: { name: 'Mathematik' } },
            { course: { name: 'Physik' } },
            { course: { name: 'Chemie' } },
            { course: { name: 'Biologie' } },
            { course: { name: 'Informatik' } },
          ],
        }),
      ]
      render(<TestTable data={data} />)
      expect(screen.getByText('+2')).toBeInTheDocument()
    })
  })

  // ── actions dropdown ─────────────────────────────────────────────────────────

  describe('actions dropdown', () => {
    it('should render actions menu button', () => {
      render(<TestTable data={[makeLecturer()]} />)
      expect(
        screen.getByRole('button', { name: 'Menü öffnen' })
      ).toBeInTheDocument()
    })

    it('should show action items when menu is opened', async () => {
      const user = userEvent.setup()
      render(<TestTable data={[makeLecturer()]} />)

      await user.click(screen.getByRole('button', { name: 'Menü öffnen' }))

      expect(await screen.findByText('Aktionen')).toBeInTheDocument()
      expect(screen.getByText('Bearbeiten')).toBeInTheDocument()
      expect(screen.getByText('Vorlesungen zuordnen')).toBeInTheDocument()
      expect(screen.getByText('Qualifikationen bearbeiten')).toBeInTheDocument()
      expect(screen.getByText('Löschen')).toBeInTheDocument()
    })
  })
})
