import { afterEach, describe, expect, it } from 'vitest'

import { EditQualificationDialog } from '@/features/courses/components/dialog/edit-lecturer-qualification'
import { cleanup, render, screen } from '@testing-library/react'

describe('EditQualificationDialog (course side)', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the trigger', () => {
    render(
      <EditQualificationDialog
        trigger={<button>Edit Qualification</button>}
        onSubmit={() => {}}
        lecturerId="l1"
      />
    )

    expect(screen.getByText('Edit Qualification')).toBeInTheDocument()
  })

  it('should show dialog title when opened', async () => {
    render(
      <EditQualificationDialog
        trigger={<button>Edit</button>}
        onSubmit={() => {}}
        lecturerId="l1"
      />
    )

    screen.getByText('Edit').click()

    expect(await screen.findByText('Details bearbeiten')).toBeInTheDocument()
  })

  it('should render experience radio options', async () => {
    render(
      <EditQualificationDialog
        trigger={<button>Edit</button>}
        onSubmit={() => {}}
        lecturerId="l1"
      />
    )

    screen.getByText('Edit').click()

    expect(await screen.findByText('Erfahrung')).toBeInTheDocument()
    expect(screen.getByLabelText(/Keine/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Extern/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Provadis/)).toBeInTheDocument()
  })

  it('should render lead time radio options', async () => {
    render(
      <EditQualificationDialog
        trigger={<button>Edit</button>}
        onSubmit={() => {}}
        lecturerId="l1"
      />
    )

    screen.getByText('Edit').click()

    expect(await screen.findByText('Vorlaufzeit')).toBeInTheDocument()
    expect(screen.getByLabelText(/Sofort/)).toBeInTheDocument()
    expect(screen.getByLabelText(/4 Wochen/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mehrere Wochen/)).toBeInTheDocument()
  })

  it('should render save and cancel buttons', async () => {
    render(
      <EditQualificationDialog
        trigger={<button>Edit</button>}
        onSubmit={() => {}}
        lecturerId="l1"
      />
    )

    screen.getByText('Edit').click()

    expect(
      await screen.findByRole('button', { name: 'Speichern' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Abbrechen' })
    ).toBeInTheDocument()
  })
})
