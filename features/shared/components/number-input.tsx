import { Minus, Plus } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/features/shared/components/ui/button'
import { ButtonGroup } from '@/features/shared/components/ui/button-group'
import { Input } from '@/features/shared/components/ui/input'
import { cn } from '@/features/shared/lib/utils'

function NumberInput({
  className,
  min = 1,
  max = 12,
  value,
  onChange,
  disabled,
  ...props
}: Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'min' | 'max'> & {
  min?: number
  max?: number
  value: number | null
  onChange: (value: number) => void
}) {
  const currentValue = value !== null && !Number.isNaN(value) ? value : min

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value
    const parsed = parseInt(val, 10)

    if (val === '' || Number.isNaN(parsed)) {
      onChange(min)
    } else {
      const clamped = Math.min(max, Math.max(min, parsed))
      if (clamped !== parsed) {
        onChange(clamped)
      }
    }

    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  return (
    <ButtonGroup className={cn(className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          props['aria-invalid'] && 'border-destructive! ring-destructive/30!'
        )}
        disabled={disabled || currentValue <= min}
        onClick={() => {
          if (disabled) return
          const next = Math.max(min, currentValue - 1)
          onChange(next)
        }}>
        <Minus />
        <span className="sr-only">Wert verringern</span>
      </Button>
      <Input
        {...props}
        disabled={disabled}
        placeholder={min.toString()}
        value={value !== null && !Number.isNaN(value) ? value : ''}
        onChange={(e) => {
          const val = e.target.value
          if (val === '') {
            onChange(NaN)
            return
          }
          const parsed = parseInt(val, 10)
          if (Number.isNaN(parsed)) {
            return
          }

          if (parsed > max) {
            onChange(max)
            return
          }

          onChange(parsed)
        }}
        onBlur={handleBlur}
        autoComplete="off"
        className={'text-center'}
        min={min}
        max={max}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          props['aria-invalid'] && 'border-destructive! ring-destructive/30!'
        )}
        disabled={disabled || currentValue >= max}
        onClick={() => {
          if (disabled) return
          const next = Math.min(max, currentValue + 1)
          onChange(next)
        }}>
        <Plus />
        <span className="sr-only">Wert erhöhen</span>
      </Button>
    </ButtonGroup>
  )
}

export { NumberInput }
