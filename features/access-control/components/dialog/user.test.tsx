import { afterEach, describe, expect, it, vi } from 'vitest'

import { UserDialog } from '@/features/access-control/components/dialog/user'
import type { AccessControlUser } from '@/features/access-control/types'
import { cleanup, render, screen } from '@testing-library/react'

describe('UserDialog', () => {
  afterEach(() => {
    cleanup()
  })

  const mockUser: AccessControlUser = {
    id: 'user-1',
    name: 'Max Mustermann',
    email: 'max@example.com',
    image: 'https://example.com/avatar.png',
    isAdmin: false,
    twoFactorEnabled: false,
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date('2025-06-01'),
    backupCodeCount: 5,
    authProviders: ['credential'],
  }

  it('should render the trigger button', () => {
    render(<UserDialog trigger={<button>Add User</button>} />)

    expect(screen.getByText('Add User')).toBeInTheDocument()
  })

  it('should show create title when no user is provided', () => {
    render(<UserDialog open={true} onOpenChange={() => {}} />)

    expect(screen.getByText('Benutzer erstellen')).toBeInTheDocument()
  })

  it('should show edit title when user is provided', () => {
    render(<UserDialog user={mockUser} open={true} onOpenChange={() => {}} />)

    expect(screen.getByText('Benutzer bearbeiten')).toBeInTheDocument()
  })

  it('should render name and email fields', () => {
    render(<UserDialog open={true} onOpenChange={() => {}} />)

    expect(document.getElementById('name')).toBeInTheDocument()
    expect(document.getElementById('email')).toBeInTheDocument()
  })

  it('should render image field', () => {
    render(<UserDialog open={true} onOpenChange={() => {}} />)

    expect(document.getElementById('image')).toBeInTheDocument()
  })

  it('should render password field when creating', () => {
    render(<UserDialog open={true} onOpenChange={() => {}} />)

    expect(document.getElementById('password')).toBeInTheDocument()
  })

  it('should NOT render password field when editing', () => {
    render(<UserDialog user={mockUser} open={true} onOpenChange={() => {}} />)

    expect(document.getElementById('password')).not.toBeInTheDocument()
  })

  it('should populate form with user data when editing', () => {
    render(<UserDialog user={mockUser} open={true} onOpenChange={() => {}} />)

    expect(document.getElementById('name')).toHaveValue('Max Mustermann')
    expect(document.getElementById('email')).toHaveValue('max@example.com')
    expect(document.getElementById('image')).toHaveValue(
      'https://example.com/avatar.png'
    )
  })

  it('should show "Erstellen" button when creating', () => {
    render(<UserDialog open={true} onOpenChange={() => {}} />)

    expect(
      screen.getByRole('button', { name: 'Erstellen' })
    ).toBeInTheDocument()
  })

  it('should show "Speichern" button when editing', () => {
    render(<UserDialog user={mockUser} open={true} onOpenChange={() => {}} />)

    expect(
      screen.getByRole('button', { name: 'Speichern' })
    ).toBeInTheDocument()
  })

  it('should show create description when creating', () => {
    render(<UserDialog open={true} onOpenChange={() => {}} />)

    expect(
      screen.getByText('Hier können Sie einen neuen Benutzer anlegen.')
    ).toBeInTheDocument()
  })

  it('should show edit description when editing', () => {
    render(<UserDialog user={mockUser} open={true} onOpenChange={() => {}} />)

    expect(
      screen.getByText('Hier können Sie einen bestehenden Benutzer bearbeiten.')
    ).toBeInTheDocument()
  })

  it('should start with empty form fields when creating', () => {
    render(<UserDialog open={true} onOpenChange={() => {}} />)

    expect(document.getElementById('name')).toHaveValue('')
    expect(document.getElementById('email')).toHaveValue('')
    expect(document.getElementById('image')).toHaveValue('')
    expect(document.getElementById('password')).toHaveValue('')
  })

  it('should handle user with null image', () => {
    const userNoImage = { ...mockUser, image: null }
    render(
      <UserDialog user={userNoImage} open={true} onOpenChange={() => {}} />
    )

    expect(document.getElementById('image')).toHaveValue('')
  })
})
