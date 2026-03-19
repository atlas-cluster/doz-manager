import { afterEach, describe, expect, it, vi } from 'vitest'

import { LecturerAssignmentDialog } from '@/features/courses/components/dialog/lecturer-assignment'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    promise: vi.fn(),
  },
}))

vi.mock('@/features/lecturers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/lecturers')>()
  return {
    ...actual,
    getLecturers: vi.fn().mockResolvedValue({
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'l2',
          title: null,
          firstName: 'Jane',
          secondName: null,
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+9876543210',
          type: 'external',
          courseLevelPreference: 'master',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pageCount: 1,
      rowCount: 2,
      facets: { type: {}, courseLevelPreference: {} },
    }),
    createLecturerCourseAssignment: vi.fn().mockResolvedValue({}),
    deleteLecturerCourseAssignment: vi.fn().mockResolvedValue({}),
  }
})

vi.mock('@/features/courses/actions/get-course-lecturer-assignments', () => ({
  getCourseLecturerAssignments: vi.fn().mockResolvedValue([
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
}))

vi.mock(
  '@/features/courses/actions/get-course-lecturer-qualifications',
  () => ({
    getCourseLecturerQualifications: vi.fn().mockResolvedValue([
      {
        lecturerId: 'l1',
        courseId: 'c1',
        experience: 'other_uni',
        leadTime: 'four_weeks',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  })
)

const course = {
  id: 'c1',
  name: 'Mathematik',
  isOpen: true,
  courseLevel: 'bachelor' as const,
  semester: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('LecturerAssignmentDialog', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render trigger when provided', () => {
    render(
      <LecturerAssignmentDialog
        course={course}
        trigger={<button>Open assignment</button>}
      />
    )

    expect(screen.getByText('Open assignment')).toBeInTheDocument()
  })

  it('should show the dialog title with course name', async () => {
    render(
      <LecturerAssignmentDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText(/Dozenten zuordnen.*Mathematik/)
    ).toBeInTheDocument()
  })

  it('should show the dialog description', async () => {
    render(
      <LecturerAssignmentDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText(
        'Hier können Sie der Vorlesung Dozenten zuweisen.'
      )
    ).toBeInTheDocument()
  })

  it('should load and display lecturers', async () => {
    render(
      <LecturerAssignmentDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Dr\. John Doe/)).toBeInTheDocument()
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
    })
  })

  it('should show qualification details and fallback text', async () => {
    render(
      <LecturerAssignmentDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Erfahrung: Extern/)).toBeInTheDocument()
      expect(screen.getByText(/Vorlaufzeit: 4 Wochen/)).toBeInTheDocument()
      expect(
        screen.getByText('Keine Qualifikation hinterlegt')
      ).toBeInTheDocument()
    })
  })

  it('should render search input and filter buttons', async () => {
    render(
      <LecturerAssignmentDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByPlaceholderText('Dozenten suchen...')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Erfahrung/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Vorlaufzeit/i })
    ).toBeInTheDocument()
  })

  it('should render Abbrechen and Speichern buttons', async () => {
    render(
      <LecturerAssignmentDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByRole('button', { name: 'Abbrechen' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Speichern' })
    ).toBeInTheDocument()
  })

  it('should call toast.promise when submitting', async () => {
    render(
      <LecturerAssignmentDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Speichern' }))

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled()
    })
  })
})
