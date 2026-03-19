import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { addAuthMethod } from '@/features/access-control/actions/add-auth-method'
import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    account: { findFirst: vi.fn(), create: vi.fn() },
  },
}))
vi.mock('next/cache', () => ({ updateTag: vi.fn() }))
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))
vi.mock('@/features/auth/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))
vi.mock('better-auth/crypto', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-pw'),
}))
vi.mock('@paralleldrive/cuid2', () => ({
  createId: vi.fn().mockReturnValue('new-id'),
}))

describe('addAuthMethod', () => {
  const adminSession = { user: { id: 'admin-1' } }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never)
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ isAdmin: true } as never) // admin check
      .mockResolvedValueOnce({ id: 'user-1' } as never) // user exists
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null as never)
    vi.mocked(prisma.account.create).mockResolvedValue({} as never)
  })

  it('should throw if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never)

    await expect(addAuthMethod('user-1', 'password123')).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockReset()
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      isAdmin: false,
    } as never)

    await expect(addAuthMethod('user-1', 'password123')).rejects.toThrow(
      'Keine Berechtigung'
    )
  })

  it('should throw if user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockReset()
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ isAdmin: true } as never)
      .mockResolvedValueOnce(null as never)

    await expect(addAuthMethod('user-1', 'password123')).rejects.toThrow(
      'Benutzer nicht gefunden'
    )
  })

  it('should throw if user already has a password', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValueOnce({
      id: 'existing',
    } as never)

    await expect(addAuthMethod('user-1', 'password123')).rejects.toThrow(
      'Benutzer hat bereits ein Passwort.'
    )
  })

  it('should throw if password is too short', async () => {
    await expect(addAuthMethod('user-1', 'short')).rejects.toThrow(
      'Das Passwort muss mindestens 8 Zeichen lang sein.'
    )
  })

  it('should throw if password is empty', async () => {
    await expect(addAuthMethod('user-1', '')).rejects.toThrow(
      'Das Passwort muss mindestens 8 Zeichen lang sein.'
    )
  })

  it('should create credential account with hashed password', async () => {
    await addAuthMethod('user-1', 'password123')

    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        id: 'new-id',
        userId: 'user-1',
        providerId: 'credential',
        accountId: 'user-1',
        password: 'hashed-pw',
      },
    })
  })

  it('should invalidate users cache tag', async () => {
    await addAuthMethod('user-1', 'password123')

    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
