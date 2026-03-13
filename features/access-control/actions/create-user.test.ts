import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUser } from '@/features/access-control/actions/create-user'
import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))
vi.mock('@/features/auth/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      signUpEmail: vi.fn(),
    },
  },
}))

describe('createUser', () => {
  const adminSession = { user: { id: 'admin-1' } }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: true,
    } as never)
  })

  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'securepass123',
  }

  it('should throw if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    await expect(createUser(userData)).rejects.toThrow('Nicht authentifiziert')
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)

    await expect(createUser(userData)).rejects.toThrow('Keine Berechtigung')
  })

  it('should throw if password is missing', async () => {
    const noPasswordData = { name: 'Test', email: 'test@example.com' }

    await expect(createUser(noPasswordData)).rejects.toThrow(
      'Passwort ist beim Erstellen erforderlich'
    )
  })

  it('should call auth.api.signUpEmail with correct data', async () => {
    await createUser(userData)

    expect(auth.api.signUpEmail).toHaveBeenCalledWith({
      body: {
        email: 'test@example.com',
        password: 'securepass123',
        name: 'Test User',
      },
    })
  })

  it('should invalidate the users cache tag', async () => {
    await createUser(userData)

    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
