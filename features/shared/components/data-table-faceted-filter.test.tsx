import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  DataTableFacetedFilter,
  type FacetOption,
} from '@/features/shared/components/data-table-faceted-filter'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const options: FacetOption[] = [
  { value: 'internal', label: 'Intern' },
  { value: 'external', label: 'Extern' },
]

describe('DataTableFacetedFilter', () => {
  afterEach(() => {
    cleanup()
  })

  describe('standalone mode (value/onChange)', () => {
    it('should render the trigger button with the title', () => {
      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          value={[]}
          onChange={() => {}}
        />
      )

      expect(screen.getByRole('button', { name: /Typ/i })).toBeInTheDocument()
    })

    it('should open the popover and show options when clicked', async () => {
      const user = userEvent.setup()

      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          value={[]}
          onChange={() => {}}
        />
      )

      await user.click(screen.getByRole('button', { name: /Typ/i }))

      expect(await screen.findByText('Intern')).toBeInTheDocument()
      expect(screen.getByText('Extern')).toBeInTheDocument()
    })

    it('should call onChange when an option is selected', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()

      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          value={[]}
          onChange={onChange}
        />
      )

      await user.click(screen.getByRole('button', { name: /Typ/i }))
      await user.click(await screen.findByText('Intern'))

      expect(onChange).toHaveBeenCalledWith(['internal'])
    })

    it('should deselect when clicking a selected option', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()

      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          value={['internal']}
          onChange={onChange}
        />
      )

      await user.click(screen.getByRole('button', { name: /Typ/i }))

      // "Intern" appears both in badge and popover list; click the one inside the option
      const allIntern = await screen.findAllByText('Intern')
      await user.click(allIntern[allIntern.length - 1])

      expect(onChange).toHaveBeenCalledWith([])
    })

    it('should show facet counts when provided', async () => {
      const user = userEvent.setup()
      const facets = new Map([
        ['internal', 5],
        ['external', 3],
      ])

      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          value={[]}
          onChange={() => {}}
          facets={facets}
        />
      )

      await user.click(screen.getByRole('button', { name: /Typ/i }))

      expect(await screen.findByText('5')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should show selected count badge when items are selected', () => {
      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          value={['internal', 'external']}
          onChange={() => {}}
        />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should show "Filter löschen" when options are selected', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()

      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          value={['internal']}
          onChange={onChange}
        />
      )

      await user.click(screen.getByRole('button', { name: /Typ/i }))

      expect(await screen.findByText('Filter löschen')).toBeInTheDocument()
    })

    it('should clear all selections when "Filter löschen" is clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()

      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          value={['internal']}
          onChange={onChange}
        />
      )

      await user.click(screen.getByRole('button', { name: /Typ/i }))
      await user.click(await screen.findByText('Filter löschen'))

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('column mode', () => {
    it('should call column.setFilterValue when an option is selected', async () => {
      const user = userEvent.setup()
      const setFilterValue = vi.fn()
      const mockColumn = {
        getFilterValue: () => undefined,
        setFilterValue,
        getFacetedUniqueValues: () => new Map(),
      } as never

      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          column={mockColumn}
        />
      )

      await user.click(screen.getByRole('button', { name: /Typ/i }))
      await user.click(await screen.findByText('Intern'))

      expect(setFilterValue).toHaveBeenCalledWith(['internal'])
    })

    it('should clear column filter when all are deselected', async () => {
      const user = userEvent.setup()
      const setFilterValue = vi.fn()
      const mockColumn = {
        getFilterValue: () => ['internal'],
        setFilterValue,
        getFacetedUniqueValues: () => new Map(),
      } as never

      render(
        <DataTableFacetedFilter
          title="Typ"
          options={options}
          column={mockColumn}
        />
      )

      await user.click(screen.getByRole('button', { name: /Typ/i }))

      // "Intern" appears both in badge and popover list; click the one inside the option
      const allIntern = await screen.findAllByText('Intern')
      await user.click(allIntern[allIntern.length - 1])

      expect(setFilterValue).toHaveBeenCalledWith(undefined)
    })
  })
})
