import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  type SidebarUser,
  SidebarUserMenu,
} from '@/features/app/components/sidebar-user-menu'
import { SidebarProvider } from '@/features/shared/components/ui/sidebar'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const mockSignOut = vi.fn().mockResolvedValue(undefined)
const mockGetProfile = vi.fn().mockResolvedValue({
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    twoFactorEnabled: false,
  },
})

vi.mock('@/features/auth', () => ({
  authClient: { signOut: () => mockSignOut() },
  getProfile: () => mockGetProfile(),
  AccountSettings: () => <div data-testid="account-settings">Settings</div>,
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), promise: vi.fn() },
}))

const testUser: SidebarUser = {
  name: 'Max Mustermann',
  email: 'max@example.com',
  image: null,
}

function renderWithSidebar(user: SidebarUser = testUser) {
  return render(
    <SidebarProvider>
      <SidebarUserMenu user={user} />
    </SidebarProvider>
  )
}

describe('SidebarUserMenu', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the user name', () => {
    renderWithSidebar()
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument()
  })

  it('should render the user email', () => {
    renderWithSidebar()
    expect(screen.getByText('max@example.com')).toBeInTheDocument()
  })

  it('should render user initials in avatar fallback', () => {
    renderWithSidebar()
    expect(screen.getByText('MM')).toBeInTheDocument()
  })

  it('should render single initial for single-name user', () => {
    renderWithSidebar({ name: 'Admin', email: 'a@b.com', image: null })
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
