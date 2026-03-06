import { afterEach, describe, expect, it, vi } from 'vitest'

import { LecturerQualificationDialog } from '@/features/courses/components/dialog/lecturer-qualification'
import { cleanup, render, screen, waitFor } from '@testing-library/react'

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
  }
})
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

const course = {
  id: 'c1',
  name: 'Mathematik',
  isOpen: true,
  courseLevel: 'bachelor' as const,
  semester: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('LecturerQualificationDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('should show the dialog title with course name', async () => {
    render(
      <LecturerQualificationDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText(/Qualifikationen Bearbeiten - Mathematik/)
    ).toBeInTheDocument()
  })

  it('should show the dialog description', async () => {
    render(
      <LecturerQualificationDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText(
        'Hier können Sie die Qualifikationen der Dozenten für diese Vorlesung bearbeiten.'
      )
    ).toBeInTheDocument()
  })

  it('should load and display lecturers after fetching', async () => {
    render(
      <LecturerQualificationDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      // Names appear in both the item title and sr-only button text
      expect(
        screen.getAllByText(/Dr\. John Doe/).length
      ).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Jane Smith/).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should show qualification details for qualified lecturers', async () => {
    render(
      <LecturerQualificationDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Erfahrung: Extern/)).toBeInTheDocument()
      expect(screen.getByText(/Vorlaufzeit: 4 Wochen/)).toBeInTheDocument()
    })
  })

  it('should show "Keine Qualifikationen vorhanden" for unqualified lecturers', async () => {
    render(
      <LecturerQualificationDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText('Keine Qualifikationen vorhanden')
      ).toBeInTheDocument()
    })
  })

  it('should render the search input', async () => {
    render(
      <LecturerQualificationDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Dozenten suchen...')
      ).toBeInTheDocument()
    })
  })

  it('should render filter buttons', async () => {
    render(
      <LecturerQualificationDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Status/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Erfahrung/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /Vorlaufzeit/i })
      ).toBeInTheDocument()
    })
  })

  it('should render "Speichern" and "Abbrechen" buttons', async () => {
    render(
      <LecturerQualificationDialog
        course={course}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByRole('button', { name: 'Speichern' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Abbrechen' })
    ).toBeInTheDocument()
  })
})
