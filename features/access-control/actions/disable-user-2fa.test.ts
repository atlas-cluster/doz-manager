import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { disableUser2FA } from '@/features/access-control/actions/disable-user-2fa'
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

describe('disableUser2FA', () => {
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

    await expect(disableUser2FA('user-1')).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)

    await expect(disableUser2FA('user-1')).rejects.toThrow('Keine Berechtigung')
  })

  it('should delete twoFactor records for the user', async () => {
    await disableUser2FA('user-1')

    expect(prisma.twoFactor.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    })
  })

  it('should set twoFactorEnabled to false on the user', async () => {
    await disableUser2FA('user-1')

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { twoFactorEnabled: false },
    })
  })

  it('should invalidate the users cache tag', async () => {
    await disableUser2FA('user-1')

    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
