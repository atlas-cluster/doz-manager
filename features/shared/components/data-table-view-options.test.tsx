import { afterEach, describe, expect, it, vi } from 'vitest'

import { DataTableViewOptions } from '@/features/shared/components/data-table-view-options'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function createMockTable(
  columns: { id: string; header: string; visible: boolean }[] = []
) {
  return {
    getAllColumns: () =>
      columns.map((col) => ({
        id: col.id,
        accessorFn: () => '',
        getCanHide: () => true,
        getIsVisible: () => col.visible,
        toggleVisibility: vi.fn(),
        columnDef: { header: col.header },
      })),
  } as never
}

describe('DataTableViewOptions', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the settings button', () => {
    const table = createMockTable()
    render(<DataTableViewOptions table={table} />)

    expect(
      screen.getByRole('button', { name: 'Spalten ausblenden' })
    ).toBeInTheDocument()
  })

  it('should show dropdown when button is clicked', async () => {
    const user = userEvent.setup()
    const table = createMockTable([
      { id: 'email', header: 'E-Mail', visible: true },
      { id: 'phone', header: 'Telefon', visible: true },
    ])
    render(<DataTableViewOptions table={table} />)

    await user.click(screen.getByRole('button', { name: 'Spalten ausblenden' }))

    expect(await screen.findByText('Spalten anzeigen')).toBeInTheDocument()
    expect(screen.getByText('E-Mail')).toBeInTheDocument()
    expect(screen.getByText('Telefon')).toBeInTheDocument()
  })
})
