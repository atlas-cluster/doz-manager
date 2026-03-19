import { afterEach, describe, expect, it, vi } from 'vitest'

import { LecturerDialog } from '@/features/lecturers/components/dialog/lecturer'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

describe('LecturerDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the trigger button', () => {
    render(<LecturerDialog trigger={<button>Open Dialog</button>} />)

    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('should show create title when no lecturer is provided', () => {
    render(<LecturerDialog open={true} onOpenChange={() => {}} />)

    expect(screen.getByText('Dozent erstellen')).toBeInTheDocument()
  })

  it('should show edit title when lecturer is provided', () => {
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

    render(
      <LecturerDialog lecturer={lecturer} open={true} onOpenChange={() => {}} />
    )

    expect(screen.getByText('Dozent bearbeiten')).toBeInTheDocument()
  })

  it('should render all form fields', () => {
    render(<LecturerDialog open={true} onOpenChange={() => {}} />)

    expect(screen.getByLabelText('Titel')).toBeInTheDocument()
    expect(document.getElementById('firstName')).toBeInTheDocument()
    expect(document.getElementById('secondName')).toBeInTheDocument()
    expect(document.getElementById('lastName')).toBeInTheDocument()
    expect(document.getElementById('email')).toBeInTheDocument()
  })

  it('should populate form with lecturer data when editing', () => {
    const lecturer = {
      id: 'l1',
      title: 'Prof.',
      firstName: 'Jane',
      secondName: 'M.',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+9876543210',
      type: 'external' as const,
      courseLevelPreference: 'master' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(
      <LecturerDialog lecturer={lecturer} open={true} onOpenChange={() => {}} />
    )

    expect(screen.getByLabelText('Titel')).toHaveValue('Prof.')
    expect(document.getElementById('firstName')).toHaveValue('Jane')
    expect(document.getElementById('secondName')).toHaveValue('M.')
    expect(document.getElementById('lastName')).toHaveValue('Smith')
    expect(document.getElementById('email')).toHaveValue('jane@example.com')
  })

  it('should show "Erstellen" button when creating', () => {
    render(<LecturerDialog open={true} onOpenChange={() => {}} />)

    expect(
      screen.getByRole('button', { name: 'Erstellen' })
    ).toBeInTheDocument()
  })

  it('should show "Speichern" button when editing', () => {
    const lecturer = {
      id: 'l1',
      title: null,
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

    render(
      <LecturerDialog lecturer={lecturer} open={true} onOpenChange={() => {}} />
    )

    expect(
      screen.getByRole('button', { name: 'Speichern' })
    ).toBeInTheDocument()
  })

  it('should not submit with missing required fields', async () => {
    const onSubmit = vi.fn()

    render(
      <LecturerDialog open={true} onOpenChange={() => {}} onSubmit={onSubmit} />
    )

    const firstNameInput = document.getElementById(
      'firstName'
    ) as HTMLInputElement
    fireEvent.change(firstNameInput, { target: { value: 'Alice' } })

    fireEvent.submit(screen.getByRole('button', { name: 'Erstellen' }))

    await waitFor(() => {
      // phone is required and missing, so onSubmit should not be called
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})
