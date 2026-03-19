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
  })

  /**
   * Helper: set up findUnique to pass the admin check and the email-exists
   * check (returns null = no existing user).
   */
  function mockAdminAndNoExistingUser() {
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ isAdmin: true } as never) // admin check
      .mockResolvedValueOnce(null as never) // email-exists check
  }

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
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      isAdmin: false,
    } as never)

    await expect(createUser(userData)).rejects.toThrow('Keine Berechtigung')
  })

  it('should create user without password via prisma when no password provided', async () => {
    mockAdminAndNoExistingUser()
    const noPasswordData = { name: 'Test', email: 'test@example.com' }

    await createUser(noPasswordData)

    expect(auth.api.signUpEmail).not.toHaveBeenCalled()
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Test',
        email: 'test@example.com',
        emailVerified: true,
      }),
    })
  })

  it('should call auth.api.signUpEmail with correct data', async () => {
    mockAdminAndNoExistingUser()
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
    mockAdminAndNoExistingUser()
    await createUser(userData)

    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
