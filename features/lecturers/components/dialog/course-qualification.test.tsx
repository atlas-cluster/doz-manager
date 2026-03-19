import { afterEach, describe, expect, it, vi } from 'vitest'

import { CourseQualificationDialog } from '@/features/lecturers/components/dialog/course-qualification'
import { cleanup, render, screen, waitFor } from '@testing-library/react'

vi.mock('@/features/courses', () => ({
  getCourses: vi.fn().mockResolvedValue({
    data: [
      { id: 'c1', name: 'Mathematik', courseLevel: 'bachelor', semester: 3 },
      { id: 'c2', name: 'Physik', courseLevel: 'master', semester: 1 },
    ],
    pageCount: 1,
    rowCount: 2,
  }),
  Course: {},
  CourseQualification: {},
}))
vi.mock(
  '@/features/lecturers/actions/get-lecturer-course-qualification',
  () => ({
    getLecturerCourseQualifications: vi.fn().mockResolvedValue([
      {
        lecturerId: 'l1',
        courseId: 'c1',
        experience: 'provadis',
        leadTime: 'short',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  })
)
vi.mock(
  '@/features/lecturers/actions/create-lecturer-course-qualification',
  () => ({
    createLecturerQualification: vi.fn().mockResolvedValue({}),
  })
)
vi.mock(
  '@/features/lecturers/actions/update-lecturer-course-qualification',
  () => ({
    updateLecturerQualification: vi.fn().mockResolvedValue({}),
  })
)

const lecturer = {
  id: 'l1',
  title: 'Prof.',
  firstName: 'Jane',
  secondName: null,
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+9876543210',
  type: 'external' as const,
  courseLevelPreference: 'master' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('CourseQualificationDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('should show the dialog title with lecturer name', async () => {
    render(
      <CourseQualificationDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText(/Qualifikationen Bearbeiten.*Prof\. Jane.*Smith/)
    ).toBeInTheDocument()
  })

  it('should show the dialog description', async () => {
    render(
      <CourseQualificationDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText(
        'Hier können Sie die Qualifikationen für den Dozenten bearbeiten.'
      )
    ).toBeInTheDocument()
  })

  it('should load and display courses after fetching', async () => {
    render(
      <CourseQualificationDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Mathematik')).toBeInTheDocument()
      expect(screen.getByText('Physik')).toBeInTheDocument()
    })
  })

  it('should show qualification details for qualified courses', async () => {
    render(
      <CourseQualificationDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Erfahrung: Provadis/)).toBeInTheDocument()
      expect(screen.getByText(/Vorlaufzeit: Sofort/)).toBeInTheDocument()
    })
  })

  it('should show "Keine Qualifikationen vorhanden" for unqualified courses', async () => {
    render(
      <CourseQualificationDialog
        lecturer={lecturer}
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
      <CourseQualificationDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Kurse suchen...')).toBeInTheDocument()
    })
  })

  it('should render filter buttons', async () => {
    render(
      <CourseQualificationDialog
        lecturer={lecturer}
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
      <CourseQualificationDialog
        lecturer={lecturer}
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
