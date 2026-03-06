import { afterEach, describe, expect, it, vi } from 'vitest'

import { CourseDialog } from '@/features/courses/components/dialog/course'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

describe('CourseDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the trigger button', () => {
    render(<CourseDialog trigger={<button>Open Dialog</button>} />)

    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('should show create title when no course is provided', () => {
    render(<CourseDialog open={true} onOpenChange={() => {}} />)

    expect(screen.getByText('Vorlesung erstellen')).toBeInTheDocument()
  })

  it('should show edit title when course is provided', () => {
    const course = {
      id: 'c1',
      name: 'Mathematik',
      isOpen: true,
      courseLevel: 'bachelor' as const,
      semester: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<CourseDialog course={course} open={true} onOpenChange={() => {}} />)

    expect(screen.getByText('Vorlesung bearbeiten')).toBeInTheDocument()
  })

  it('should render all form fields', () => {
    render(<CourseDialog open={true} onOpenChange={() => {}} />)

    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByText(/Semester/)).toBeInTheDocument()
    expect(screen.getByText(/Vorlesungsstufe/)).toBeInTheDocument()
    expect(screen.getByText(/Status/)).toBeInTheDocument()
  })

  it('should populate form with course data when editing', () => {
    const course = {
      id: 'c1',
      name: 'Physik',
      isOpen: false,
      courseLevel: 'master' as const,
      semester: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<CourseDialog course={course} open={true} onOpenChange={() => {}} />)

    expect(screen.getByLabelText(/Name/)).toHaveValue('Physik')
  })

  it('should show "Erstellen" button when creating', () => {
    render(<CourseDialog open={true} onOpenChange={() => {}} />)

    expect(
      screen.getByRole('button', { name: 'Erstellen' })
    ).toBeInTheDocument()
  })

  it('should show "Speichern" button when editing', () => {
    const course = {
      id: 'c1',
      name: 'Mathematik',
      isOpen: true,
      courseLevel: 'bachelor' as const,
      semester: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<CourseDialog course={course} open={true} onOpenChange={() => {}} />)

    expect(
      screen.getByRole('button', { name: 'Speichern' })
    ).toBeInTheDocument()
  })

  it('should call onSubmit with valid form data', async () => {
    const onSubmit = vi.fn()

    render(
      <CourseDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />
    )

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: 'Informatik' },
    })

    fireEvent.submit(screen.getByRole('button', { name: 'Erstellen' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Informatik',
        })
      )
    })
  })

  it('should not submit with invalid name (too short)', async () => {
    const onSubmit = vi.fn()

    render(
      <CourseDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />
    )

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: 'A' },
    })

    fireEvent.submit(screen.getByRole('button', { name: 'Erstellen' }))

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})
