import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { saveAuthSettings } from '@/features/auth/actions/save-auth-settings'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    authSettings: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))
vi.mock('@/features/auth/lib/encrypt', () => ({
  encrypt: vi.fn((v: string) => `encrypted:${v}`),
}))
vi.mock('@/features/auth/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: 'admin-1' },
      }),
    },
  },
  reinitializeAuth: vi.fn().mockResolvedValue(undefined),
}))

describe('saveAuthSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: true,
    } as never)
    vi.mocked(prisma.authSettings.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.authSettings.upsert).mockResolvedValue({} as never)
  })

  it('should throw if user is not authenticated', async () => {
    const { auth } = await import('@/features/auth/lib/auth')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never)

    await expect(
      saveAuthSettings({
        passwordEnabled: true,
        passkeyEnabled: false,
        microsoftEnabled: false,
        githubEnabled: false,
        oauthEnabled: false,
      })
    ).rejects.toThrow('Nicht authentifiziert')
  })

  it('should throw if user is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      isAdmin: false,
    } as never)

    await expect(
      saveAuthSettings({
        passwordEnabled: true,
        passkeyEnabled: false,
        microsoftEnabled: false,
        githubEnabled: false,
        oauthEnabled: false,
      })
    ).rejects.toThrow('Keine Berechtigung')
  })

  it('should throw if all auth methods are disabled', async () => {
    await expect(
      saveAuthSettings({
        passwordEnabled: false,
        passkeyEnabled: false,
        microsoftEnabled: false,
        githubEnabled: false,
        oauthEnabled: false,
      })
    ).rejects.toThrow('Mindestens eine Anmeldemethode muss aktiviert bleiben.')
  })

  it('should upsert auth settings and invalidate cache tags', async () => {
    await saveAuthSettings({
      passwordEnabled: true,
      passkeyEnabled: false,
      microsoftEnabled: false,
      githubEnabled: false,
      oauthEnabled: false,
    })

    expect(prisma.authSettings.upsert).toHaveBeenCalledTimes(1)
    expect(updateTag).toHaveBeenCalledWith('auth-settings')
    expect(updateTag).toHaveBeenCalledWith('users')
  })

  it('should encrypt provided client secrets', async () => {
    const { encrypt } = await import('@/features/auth/lib/encrypt')

    await saveAuthSettings({
      passwordEnabled: true,
      passkeyEnabled: false,
      microsoftEnabled: true,
      microsoftClientId: 'ms-id',
      microsoftClientSecret: 'ms-secret',
      microsoftTenantId: 'ms-tenant',
      githubEnabled: false,
      oauthEnabled: false,
    })

    expect(encrypt).toHaveBeenCalledWith('ms-id')
    expect(encrypt).toHaveBeenCalledWith('ms-secret')
    expect(encrypt).toHaveBeenCalledWith('ms-tenant')
  })

  it('should reinitialize auth after saving', async () => {
    const { reinitializeAuth } = await import('@/features/auth/lib/auth')

    await saveAuthSettings({
      passwordEnabled: true,
      passkeyEnabled: false,
      microsoftEnabled: false,
      githubEnabled: false,
      oauthEnabled: false,
    })

    expect(reinitializeAuth).toHaveBeenCalledTimes(1)
  })
})
