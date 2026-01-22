import { Check, PlusCircle } from 'lucide-react'
import type { ComponentType } from 'react'

import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
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
import { cn } from '@/features/shared/lib/utils'
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
}: {
  column?: Column<TData, unknown>
  title: string
  options: FacetOption[]
}) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set<string>(
    (column?.getFilterValue() as string[]) ?? []
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
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
                        variant="secondary"
                        className="rounded-sm px-1 font-normal">
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
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}>
                      <Check className="h-4 w-4" />
                    </div>

                    {Icon ? (
                      <Icon className="text-muted-foreground mr-2 h-4 w-4" />
                    ) : null}

                    <span>{option.label}</span>

                    <span className="text-muted-foreground ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
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
