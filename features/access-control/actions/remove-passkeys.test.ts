import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { removePasskeys } from '@/features/access-control/actions/remove-passkeys'
import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    account: { findMany: vi.fn() },
    passkey: { findMany: vi.fn(), deleteMany: vi.fn() },
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

describe('removePasskeys', () => {
  const adminSession = { user: { id: 'admin-1' } }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: true,
    } as never)
    vi.mocked(prisma.passkey.findMany).mockResolvedValue([
      { id: 'pk-1' },
    ] as never)
    vi.mocked(prisma.account.findMany).mockResolvedValue([
      { providerId: 'credential' },
    ] as never)
    vi.mocked(prisma.passkey.deleteMany).mockResolvedValue({} as never)
  })

  it('should throw if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never)
    await expect(removePasskeys('user-1')).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      isAdmin: false,
    } as never)
    await expect(removePasskeys('user-1')).rejects.toThrow('Keine Berechtigung')
  })

  it('should throw if user has no passkeys', async () => {
    vi.mocked(prisma.passkey.findMany).mockResolvedValueOnce([] as never)
    await expect(removePasskeys('user-1')).rejects.toThrow(
      'Benutzer hat keine Passkeys.'
    )
  })

  it('should throw if removing passkeys would leave no auth methods', async () => {
    vi.mocked(prisma.account.findMany).mockResolvedValueOnce([] as never)
    await expect(removePasskeys('user-1')).rejects.toThrow(
      'Mindestens eine Anmeldemethode muss verbleiben'
    )
  })

  it('should delete all passkeys for the user', async () => {
    await removePasskeys('user-1')
    expect(prisma.passkey.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    })
  })

  it('should invalidate users cache tag', async () => {
    await removePasskeys('user-1')
    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
