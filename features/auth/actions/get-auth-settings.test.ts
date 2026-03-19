import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getAuthSettings } from '@/features/auth/actions/get-auth-settings'
import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    authSettings: {
      findUnique: vi.fn(),
    },
  },
}))
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
vi.mock('@/features/auth/lib/encrypt', () => ({
  decrypt: vi.fn((v: string) => `decrypted:${v}`),
}))

describe('getAuthSettings', () => {
  const adminSession = { user: { id: 'admin-1' } }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: true,
    } as never)
  })

  it('should throw if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never)
    await expect(getAuthSettings()).rejects.toThrow('Nicht authentifiziert')
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      isAdmin: false,
    } as never)
    await expect(getAuthSettings()).rejects.toThrow('Keine Berechtigung')
  })

  it('should return default settings when no row exists', async () => {
    vi.mocked(prisma.authSettings.findUnique).mockResolvedValue(null)

    const result = await getAuthSettings()

    expect(result).toEqual({
      passwordEnabled: true,
      passkeyEnabled: true,
      microsoftEnabled: false,
      microsoftClientId: '',
      microsoftTenantId: '',
      microsoftHasSecret: false,
      githubEnabled: false,
      githubClientId: '',
      githubHasSecret: false,
      oauthEnabled: false,
      oauthClientId: '',
      oauthIssuerUrl: '',
      oauthHasSecret: false,
    })
  })

  it('should decrypt stored values and return settings', async () => {
    vi.mocked(prisma.authSettings.findUnique).mockResolvedValue({
      passwordEnabled: true,
      passkeyEnabled: false,
      microsoftEnabled: true,
      microsoftClientId: 'enc-ms-id',
      microsoftTenantId: 'enc-ms-tenant',
      microsoftClientSecret: 'enc-ms-secret',
      githubEnabled: true,
      githubClientId: 'enc-gh-id',
      githubClientSecret: 'enc-gh-secret',
      oauthEnabled: true,
      oauthClientId: 'enc-oa-id',
      oauthClientSecret: 'enc-oa-secret',
      oauthIssuerUrl: 'enc-oa-url',
    } as never)

    const result = await getAuthSettings()

    expect(result.passwordEnabled).toBe(true)
    expect(result.passkeyEnabled).toBe(false)
    expect(result.microsoftEnabled).toBe(true)
    expect(result.microsoftClientId).toBe('decrypted:enc-ms-id')
    expect(result.microsoftTenantId).toBe('decrypted:enc-ms-tenant')
    expect(result.microsoftHasSecret).toBe(true)
    expect(result.githubEnabled).toBe(true)
    expect(result.githubClientId).toBe('decrypted:enc-gh-id')
    expect(result.githubHasSecret).toBe(true)
    expect(result.oauthEnabled).toBe(true)
    expect(result.oauthClientId).toBe('decrypted:enc-oa-id')
    expect(result.oauthIssuerUrl).toBe('decrypted:enc-oa-url')
    expect(result.oauthHasSecret).toBe(true)
  })

  it('should return empty strings for null encrypted fields', async () => {
    vi.mocked(prisma.authSettings.findUnique).mockResolvedValue({
      passwordEnabled: true,
      passkeyEnabled: true,
      microsoftEnabled: false,
      microsoftClientId: null,
      microsoftTenantId: null,
      microsoftClientSecret: null,
      githubEnabled: false,
      githubClientId: null,
      githubClientSecret: null,
      oauthEnabled: false,
      oauthClientId: null,
      oauthClientSecret: null,
      oauthIssuerUrl: null,
    } as never)

    const result = await getAuthSettings()

    expect(result.microsoftClientId).toBe('')
    expect(result.microsoftTenantId).toBe('')
    expect(result.microsoftHasSecret).toBe(false)
    expect(result.githubClientId).toBe('')
    expect(result.githubHasSecret).toBe(false)
    expect(result.oauthClientId).toBe('')
    expect(result.oauthIssuerUrl).toBe('')
    expect(result.oauthHasSecret).toBe(false)
  })
})
