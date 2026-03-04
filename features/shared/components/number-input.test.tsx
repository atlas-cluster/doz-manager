import { afterEach, describe, expect, it, vi } from 'vitest'

import { NumberInput } from '@/features/shared/components/number-input'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

describe('NumberInput', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render with the given value', () => {
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('5')
  })

  it('should render empty when value is null', () => {
    const onChange = vi.fn()
    render(<NumberInput value={null} onChange={onChange} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('should increment value when plus button is clicked', () => {
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} min={1} max={12} />)

    const plusButton = screen.getByRole('button', { name: 'Wert erhöhen' })
    fireEvent.click(plusButton)

    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('should decrement value when minus button is clicked', () => {
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} min={1} max={12} />)

    const minusButton = screen.getByRole('button', { name: 'Wert verringern' })
    fireEvent.click(minusButton)

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('should not go below min', () => {
    const onChange = vi.fn()
    render(<NumberInput value={1} onChange={onChange} min={1} max={12} />)

    const minusButton = screen.getByRole('button', { name: 'Wert verringern' })
    expect(minusButton).toBeDisabled()
  })

  it('should not go above max', () => {
    const onChange = vi.fn()
    render(<NumberInput value={12} onChange={onChange} min={1} max={12} />)

    const plusButton = screen.getByRole('button', { name: 'Wert erhöhen' })
    expect(plusButton).toBeDisabled()
  })

  it('should clamp value to max on input change', () => {
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} min={1} max={12} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '15' } })

    expect(onChange).toHaveBeenCalledWith(12)
  })

  it('should call onChange with NaN when input is cleared', () => {
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} min={1} max={12} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })

    expect(onChange).toHaveBeenCalledWith(NaN)
  })

  it('should clamp to min on blur with empty value', () => {
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} min={1} max={12} />)

    const input = screen.getByRole('textbox')
    fireEvent.blur(input, { target: { value: '' } })

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('should disable buttons when disabled prop is true', () => {
    const onChange = vi.fn()
    render(<NumberInput value={5} onChange={onChange} disabled />)

    const minusButton = screen.getByRole('button', { name: 'Wert verringern' })
    const plusButton = screen.getByRole('button', { name: 'Wert erhöhen' })

    expect(minusButton).toBeDisabled()
    expect(plusButton).toBeDisabled()
  })
})
