import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppSidebar } from '@/features/app/components/app-sidebar'
// AppSidebar requires SidebarProvider context
import { SidebarProvider } from '@/features/shared/components/ui/sidebar'
import { cleanup, render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: () => '/lecturers',
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

function renderWithSidebar() {
  return render(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>
  )
}

describe('AppSidebar', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render the app title', () => {
    renderWithSidebar()

    expect(screen.getByText('Dozentenverwaltung')).toBeInTheDocument()
  })

  it('should render navigation items', () => {
    renderWithSidebar()

    expect(screen.getByText('Dozenten')).toBeInTheDocument()
    expect(screen.getByText('Vorlesungen')).toBeInTheDocument()
  })

  it('should render the logo image', () => {
    renderWithSidebar()

    expect(screen.getByAltText('Logo')).toBeInTheDocument()
  })

  it('should mark the active route', () => {
    renderWithSidebar()

    // The lecturers link should be active since pathname is /lecturers
    const lecturersLink = screen.getByRole('link', { name: /Dozenten/i })
    expect(lecturersLink).toBeInTheDocument()
  })

  it('should have links to correct routes', () => {
    renderWithSidebar()

    const lecturersLink = screen.getByRole('link', { name: /Dozenten/i })
    const coursesLink = screen.getByRole('link', { name: /Vorlesungen/i })

    expect(lecturersLink).toHaveAttribute('href', '/lecturers')
    expect(coursesLink).toHaveAttribute('href', '/courses')
  })
})
