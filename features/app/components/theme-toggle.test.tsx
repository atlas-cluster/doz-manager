import { afterEach, describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from '@/features/app/components/theme-toggle'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

const mockSetTheme = vi.fn()
let mockTheme = 'system'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockTheme,
  }),
}))

describe('ThemeToggle', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    mockTheme = 'system'
  })

  it('should render a button with toggle theme label', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'Toggle theme' })
    expect(button).toBeInTheDocument()
  })

  it('should cycle from light to system on click', () => {
    mockTheme = 'light'
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'Toggle theme' })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })

  it('should cycle from system to dark on click', () => {
    mockTheme = 'system'
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'Toggle theme' })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should cycle from dark to light on click', () => {
    mockTheme = 'dark'
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'Toggle theme' })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
