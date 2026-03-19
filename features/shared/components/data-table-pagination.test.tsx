import { afterEach, describe, expect, it, vi } from 'vitest'

import { DataTablePagination } from '@/features/shared/components/data-table-pagination'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

function createMockTable(overrides: Record<string, unknown> = {}) {
  return {
    getState: () => ({
      pagination: { pageIndex: 0, pageSize: 10 },
    }),
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    getFilteredRowModel: () => ({ rows: Array(25) }),
    getPageCount: () => 3,
    getCanPreviousPage: () => false,
    getCanNextPage: () => true,
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    ...overrides,
  } as never
}

describe('DataTablePagination', () => {
  afterEach(() => {
    cleanup()
  })

  it('should display current page info', () => {
    const table = createMockTable()
    render(<DataTablePagination table={table} />)

    expect(screen.getByText(/Seite 1 von/)).toBeInTheDocument()
    expect(screen.getByText(/3/)).toBeInTheDocument()
  })

  it('should display selected row count', () => {
    const table = createMockTable({
      getFilteredSelectedRowModel: () => ({
        rows: [{ id: '1' }, { id: '2' }],
      }),
    })
    render(<DataTablePagination table={table} />)

    expect(screen.getByText(/2 von/)).toBeInTheDocument()
  })

  it('should disable first/prev buttons on first page', () => {
    const table = createMockTable({
      getCanPreviousPage: () => false,
    })
    render(<DataTablePagination table={table} />)

    const firstPageBtn = screen.getByRole('button', {
      name: 'Gehe zur ersten Seite',
    })
    const prevPageBtn = screen.getByRole('button', {
      name: 'Gehe zur vorherigen Seite',
    })

    expect(firstPageBtn).toBeDisabled()
    expect(prevPageBtn).toBeDisabled()
  })

  it('should enable next/last buttons when not on last page', () => {
    const table = createMockTable({
      getCanNextPage: () => true,
    })
    render(<DataTablePagination table={table} />)

    const nextPageBtn = screen.getByRole('button', {
      name: 'Gehe zur nächsten Seite',
    })
    const lastPageBtn = screen.getByRole('button', {
      name: 'Gehe zur letzten Seite',
    })

    expect(nextPageBtn).not.toBeDisabled()
    expect(lastPageBtn).not.toBeDisabled()
  })

  it('should disable next/last buttons on last page', () => {
    const table = createMockTable({
      getCanNextPage: () => false,
      getCanPreviousPage: () => true,
    })
    render(<DataTablePagination table={table} />)

    const nextPageBtn = screen.getByRole('button', {
      name: 'Gehe zur nächsten Seite',
    })
    const lastPageBtn = screen.getByRole('button', {
      name: 'Gehe zur letzten Seite',
    })

    expect(nextPageBtn).toBeDisabled()
    expect(lastPageBtn).toBeDisabled()
  })

  it('should call nextPage when next button is clicked', () => {
    const nextPage = vi.fn()
    const table = createMockTable({ nextPage, getCanNextPage: () => true })
    render(<DataTablePagination table={table} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Gehe zur nächsten Seite' })
    )

    expect(nextPage).toHaveBeenCalled()
  })

  it('should call previousPage when previous button is clicked', () => {
    const previousPage = vi.fn()
    const table = createMockTable({
      previousPage,
      getCanPreviousPage: () => true,
    })
    render(<DataTablePagination table={table} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Gehe zur vorherigen Seite' })
    )

    expect(previousPage).toHaveBeenCalled()
  })

  it('should call setPageIndex(0) when first page button is clicked', () => {
    const setPageIndex = vi.fn()
    const table = createMockTable({
      setPageIndex,
      getCanPreviousPage: () => true,
    })
    render(<DataTablePagination table={table} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Gehe zur ersten Seite' })
    )

    expect(setPageIndex).toHaveBeenCalledWith(0)
  })

  it('should call setPageIndex with last page when last page button is clicked', () => {
    const setPageIndex = vi.fn()
    const table = createMockTable({
      setPageIndex,
      getCanNextPage: () => true,
      getPageCount: () => 5,
    })
    render(<DataTablePagination table={table} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Gehe zur letzten Seite' })
    )

    expect(setPageIndex).toHaveBeenCalledWith(4)
  })
})
