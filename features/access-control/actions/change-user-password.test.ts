import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { changeUserPassword } from '@/features/access-control/actions/change-user-password'
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
    },
  },
}))
vi.mock('better-auth/crypto', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password-123'),
}))

describe('changeUserPassword', () => {
  const adminSession = { user: { id: 'admin-1' } }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: true,
    } as never)
  })

  it('should throw if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    await expect(changeUserPassword('user-1', 'newpass123')).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)

    await expect(changeUserPassword('user-1', 'newpass123')).rejects.toThrow(
      'Keine Berechtigung'
    )
  })

  it('should throw if password is too short', async () => {
    await expect(changeUserPassword('user-1', 'short')).rejects.toThrow(
      'Das Passwort muss mindestens 8 Zeichen lang sein.'
    )
  })

  it('should hash the password and update the account', async () => {
    await changeUserPassword('user-1', 'newSecurePassword123')

    expect(prisma.account.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', providerId: 'credential' },
      data: { password: 'hashed-password-123' },
    })
  })

  it('should invalidate the users cache tag', async () => {
    await changeUserPassword('user-1', 'newSecurePassword123')

    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
