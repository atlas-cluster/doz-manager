import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppHeader } from '@/features/app/components/app-header'
import { SidebarProvider } from '@/features/shared/components/ui/sidebar'
import { cleanup, render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: () => '/lecturers',
}))

function renderWithProviders() {
  return render(
    <SidebarProvider>
      <AppHeader />
    </SidebarProvider>
  )
}

describe('AppHeader', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the formatted route name', () => {
    renderWithProviders()

    expect(screen.getByText('Dozenten')).toBeInTheDocument()
  })

  it('should render the theme toggle', () => {
    renderWithProviders()

    expect(
      screen.getByRole('button', { name: 'Toggle theme' })
    ).toBeInTheDocument()
  })
})
