import { PlusCircle } from 'lucide-react'
import type { ComponentType } from 'react'

import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/features/shared/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/components/ui/popover'
import { Separator } from '@/features/shared/components/ui/separator'
import type { Column } from '@tanstack/react-table'

export type FacetOption = {
  label: string
  value: string
  icon?: ComponentType<{ className?: string }>
}

export function DataTableFacetedFilter<TData>({
  column,
  title,
  options,
  facets: customFacets,
}: {
  column?: Column<TData, unknown>
  title: string
  options: FacetOption[]
  facets?: Map<string, number>
}) {
  const facets = customFacets ?? column?.getFacetedUniqueValues()
  const selectedValues = new Set<string>(
    (column?.getFilterValue() as string[]) ?? []
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-dashed"
          suppressHydrationWarning>
          <PlusCircle />
          {title}

          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />

              {/* small count on mobile */}
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>

              {/* labels on desktop */}
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal">
                    {selectedValues.size} ausgewählt
                  </Badge>
                ) : (
                  options
                    .filter((o) => selectedValues.has(o.value))
                    .map((o) => (
                      <Badge
                        key={o.value}
                        className="rounded-sm px-1 font-normal">
                        {o.icon ? <o.icon /> : null}
                        {o.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-55 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Filtere ${title}...`} />
          <CommandList>
            <CommandEmpty>Keine Ergebnisse.</CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                const count = facets?.get(option.value) ?? 0
                const Icon = option.icon

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (!column) return

                      const next = new Set(selectedValues)
                      if (isSelected) next.delete(option.value)
                      else next.add(option.value)

                      const values = Array.from(next)
                      column.setFilterValue(values.length ? values : undefined)
                    }}>
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                    />

                    {Icon ? <Icon className="text-muted-foreground" /> : null}

                    <span>{option.label}</span>

                    <span className="text-muted-foreground ml-auto flex items-center justify-center font-mono text-xs">
                      {count}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center">
                    Filter löschen
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
