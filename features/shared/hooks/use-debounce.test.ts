import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from '@/features/shared/hooks/use-debounce'
import { act, renderHook } from '@testing-library/react'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello'))
    expect(result.current).toBe('hello')
  })

  it('should not update the value before 250ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'hello' },
    })

    rerender({ value: 'world' })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe('hello')
  })

  it('should update the value after 250ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'hello' },
    })

    rerender({ value: 'world' })
    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current).toBe('world')
  })

  it('should reset the timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Only 200ms since last change, should still be 'a'
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(50)
    })

    // Now 250ms since last change, should be 'c'
    expect(result.current).toBe('c')
  })

  it('should work with number values', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 1 },
    })

    rerender({ value: 42 })
    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current).toBe(42)
  })
})
