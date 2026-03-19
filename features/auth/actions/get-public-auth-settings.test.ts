import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getPublicAuthSettings } from '@/features/auth/actions/get-public-auth-settings'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    authSettings: {
      findUnique: vi.fn(),
    },
  },
}))

describe('getPublicAuthSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return default settings when no row exists', async () => {
    vi.mocked(prisma.authSettings.findUnique).mockResolvedValue(null)

    const result = await getPublicAuthSettings()

    expect(result).toEqual({
      passwordEnabled: true,
      passkeyEnabled: true,
      microsoftEnabled: false,
      githubEnabled: false,
      oauthEnabled: false,
    })
  })

  it('should return enabled flags from stored settings', async () => {
    vi.mocked(prisma.authSettings.findUnique).mockResolvedValue({
      passwordEnabled: true,
      passkeyEnabled: false,
      microsoftEnabled: true,
      microsoftClientId: 'ms-id',
      microsoftClientSecret: 'ms-secret',
      githubEnabled: true,
      githubClientId: 'gh-id',
      githubClientSecret: 'gh-secret',
      oauthEnabled: true,
      oauthClientId: 'oa-id',
      oauthClientSecret: 'oa-secret',
      oauthIssuerUrl: 'https://auth.example.com',
    } as never)

    const result = await getPublicAuthSettings()

    expect(result).toEqual({
      passwordEnabled: true,
      passkeyEnabled: false,
      microsoftEnabled: true,
      githubEnabled: true,
      oauthEnabled: true,
    })
  })

  it('should report provider as disabled when enabled but credentials missing', async () => {
    vi.mocked(prisma.authSettings.findUnique).mockResolvedValue({
      passwordEnabled: true,
      passkeyEnabled: true,
      microsoftEnabled: true,
      microsoftClientId: null,
      microsoftClientSecret: null,
      githubEnabled: true,
      githubClientId: 'gh-id',
      githubClientSecret: null,
      oauthEnabled: true,
      oauthClientId: 'oa-id',
      oauthClientSecret: 'oa-secret',
      oauthIssuerUrl: null,
    } as never)

    const result = await getPublicAuthSettings()

    expect(result.microsoftEnabled).toBe(false)
    expect(result.githubEnabled).toBe(false)
    expect(result.oauthEnabled).toBe(false)
  })

  it('should report provider as disabled when flag is off even with credentials', async () => {
    vi.mocked(prisma.authSettings.findUnique).mockResolvedValue({
      passwordEnabled: true,
      passkeyEnabled: true,
      microsoftEnabled: false,
      microsoftClientId: 'ms-id',
      microsoftClientSecret: 'ms-secret',
      githubEnabled: false,
      githubClientId: 'gh-id',
      githubClientSecret: 'gh-secret',
      oauthEnabled: false,
      oauthClientId: 'oa-id',
      oauthClientSecret: 'oa-secret',
      oauthIssuerUrl: 'https://auth.example.com',
    } as never)

    const result = await getPublicAuthSettings()

    expect(result.microsoftEnabled).toBe(false)
    expect(result.githubEnabled).toBe(false)
    expect(result.oauthEnabled).toBe(false)
  })
})
