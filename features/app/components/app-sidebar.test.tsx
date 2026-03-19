import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppSidebar } from '@/features/app/components/app-sidebar'
// AppSidebar requires SidebarProvider context
import { SidebarProvider } from '@/features/shared/components/ui/sidebar'
import { cleanup, render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: () => '/lecturers',
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const alt = typeof props.alt === 'string' ? props.alt : ''
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={alt} />
  },
}))

vi.mock('@/features/auth', () => ({
  authClient: {
    signOut: vi.fn(),
  },
  AccountSettings: () => <div data-testid="account-settings">Settings</div>,
}))

function renderWithSidebar(isAdmin = true) {
  return render(
    <SidebarProvider>
      <AppSidebar
        user={{
          id: 'user-1',
          name: 'Max Mustermann',
          email: 'max.mustermann@example.com',
          image: null,
          twoFactorEnabled: false,
        }}
        isAdmin={isAdmin}
      />
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

  it('should show access-control link for admins', () => {
    renderWithSidebar(true)

    expect(screen.getByText('Zugriffsverwaltung')).toBeInTheDocument()
  })

  it('should hide access-control link for non-admins', () => {
    renderWithSidebar(false)

    expect(screen.queryByText('Zugriffsverwaltung')).not.toBeInTheDocument()
  })

  it('should render user information in the sidebar footer', () => {
    renderWithSidebar()

    expect(screen.getByText('Max Mustermann')).toBeInTheDocument()
    expect(screen.getByText('max.mustermann@example.com')).toBeInTheDocument()
  })
})
