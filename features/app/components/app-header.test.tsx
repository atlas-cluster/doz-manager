import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppHeader } from '@/features/app/components/app-header'
import { SidebarProvider } from '@/features/shared/components/ui/sidebar'
import { cleanup, render, screen } from '@testing-library/react'

let mockPathname = '/lecturers'
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({}),
}))

function renderWithProviders(props: { isAdmin?: boolean } = {}) {
  return render(
    <SidebarProvider>
      <AppHeader isAdmin={props.isAdmin ?? false} />
    </SidebarProvider>
  )
}

describe('AppHeader', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    mockPathname = '/lecturers'
    vi.spyOn(window.crypto, 'randomUUID').mockReturnValue('tab-connection-1')
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
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

  it('should render admin badge when isAdmin is true', () => {
    renderWithProviders({ isAdmin: true })

    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should not render admin badge when isAdmin is false', () => {
    renderWithProviders({ isAdmin: false })

    expect(screen.queryByText('Admin')).not.toBeInTheDocument()

    it('should render a different route name for courses', () => {
      mockPathname = '/courses'
      renderWithProviders()

      expect(screen.getByText('Vorlesungen')).toBeInTheDocument()
    })

    it('should store the connection ID in session storage', () => {
      renderWithProviders()

      expect(window.sessionStorage.getItem('doz-client-connection-id')).toBe(
        'tab-connection-1'
      )
    })
  })
})
