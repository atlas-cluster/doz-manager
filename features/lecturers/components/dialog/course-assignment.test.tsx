import { afterEach, describe, expect, it, vi } from 'vitest'

import { CourseAssignmentDialog } from '@/features/lecturers/components/dialog/course-assignment'
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
}))
vi.mock('@/features/lecturers/actions/get-lecturer-course-assignments', () => ({
  getLecturerCourseAssignments: vi
    .fn()
    .mockResolvedValue([
      { id: 'c1', name: 'Mathematik', courseLevel: 'bachelor', semester: 3 },
    ]),
}))
vi.mock(
  '@/features/lecturers/actions/create-lecturer-course-assignment',
  () => ({
    createLecturerCourseAssignment: vi.fn().mockResolvedValue({}),
  })
)
vi.mock(
  '@/features/lecturers/actions/delete-lecturer-course-assignment',
  () => ({
    deleteLecturerCourseAssignment: vi.fn().mockResolvedValue({}),
  })
)

const lecturer = {
  id: 'l1',
  title: 'Dr.',
  firstName: 'John',
  secondName: null,
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  type: 'internal' as const,
  courseLevelPreference: 'both' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('CourseAssignmentDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the trigger when provided', () => {
    render(
      <CourseAssignmentDialog
        lecturer={lecturer}
        trigger={<button>Assign Courses</button>}
      />
    )

    expect(screen.getByText('Assign Courses')).toBeInTheDocument()
  })

  it('should show dialog title with lecturer name when open', async () => {
    render(
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText(/Vorlesungen zuordnen.*Dr\. John.*Doe/)
    ).toBeInTheDocument()
  })

  it('should show the dialog description', async () => {
    render(
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByText('Weisen Sie diesem Dozenten Vorlesungen zu')
    ).toBeInTheDocument()
  })

  it('should load and display assigned courses', async () => {
    render(
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Mathematik')).toBeInTheDocument()
    })
  })

  it('should show the "Speichern" button', async () => {
    render(
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByRole('button', { name: 'Speichern' })
    ).toBeInTheDocument()
  })

  it('should show the "Abbrechen" button', async () => {
    render(
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByRole('button', { name: 'Abbrechen' })
    ).toBeInTheDocument()
  })

  it('should show readonly mode title when readonly', async () => {
    render(
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
        readonly
      />
    )

    expect(await screen.findByText(/Vorlesungen ansehen/)).toBeInTheDocument()
  })

  it('should show "Schließen" button in readonly mode', async () => {
    render(
      <CourseAssignmentDialog
        lecturer={lecturer}
        open={true}
        onOpenChange={() => {}}
        readonly
      />
    )

    expect(
      await screen.findByRole('button', { name: 'Schließen' })
    ).toBeInTheDocument()
  })
})
