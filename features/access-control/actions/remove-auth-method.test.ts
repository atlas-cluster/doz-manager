import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { removeAuthMethod } from '@/features/access-control/actions/remove-auth-method'
import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    account: { findMany: vi.fn(), deleteMany: vi.fn() },
    passkey: { findMany: vi.fn() },
    twoFactor: { deleteMany: vi.fn() },
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

describe('removeAuthMethod', () => {
  const adminSession = { user: { id: 'admin-1' } }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: true,
    } as never)
    vi.mocked(prisma.account.findMany).mockResolvedValue([
      { providerId: 'credential' },
      { providerId: 'microsoft' },
    ] as never)
    vi.mocked(prisma.passkey.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.account.deleteMany).mockResolvedValue({} as never)
  })

  it('should throw if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never)
    await expect(removeAuthMethod('user-1', 'credential')).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      isAdmin: false,
    } as never)
    await expect(removeAuthMethod('user-1', 'credential')).rejects.toThrow(
      'Keine Berechtigung'
    )
  })

  it('should throw if removing the last auth method', async () => {
    vi.mocked(prisma.account.findMany).mockResolvedValueOnce([
      { providerId: 'credential' },
    ] as never)
    vi.mocked(prisma.passkey.findMany).mockResolvedValueOnce([] as never)
    await expect(removeAuthMethod('user-1', 'credential')).rejects.toThrow(
      'Mindestens eine Anmeldemethode muss verbleiben'
    )
  })

  it('should allow removal when other auth methods remain', async () => {
    await removeAuthMethod('user-1', 'microsoft')
    expect(prisma.account.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', providerId: 'microsoft' },
    })
  })

  it('should also disable 2FA when removing credential provider', async () => {
    vi.mocked(prisma.twoFactor.deleteMany).mockResolvedValue({} as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    await removeAuthMethod('user-1', 'credential')
    expect(prisma.twoFactor.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    })
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { twoFactorEnabled: false },
    })
  })

  it('should not disable 2FA when removing non-credential provider', async () => {
    await removeAuthMethod('user-1', 'microsoft')
    expect(prisma.twoFactor.deleteMany).not.toHaveBeenCalled()
  })

  it('should allow removal when passkeys remain as alternative', async () => {
    vi.mocked(prisma.account.findMany).mockResolvedValueOnce([
      { providerId: 'credential' },
    ] as never)
    vi.mocked(prisma.passkey.findMany).mockResolvedValueOnce([
      { id: 'pk-1' },
    ] as never)
    vi.mocked(prisma.twoFactor.deleteMany).mockResolvedValue({} as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    await removeAuthMethod('user-1', 'credential')
    expect(prisma.account.deleteMany).toHaveBeenCalled()
  })

  it('should invalidate users cache tag', async () => {
    await removeAuthMethod('user-1', 'microsoft')
    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
