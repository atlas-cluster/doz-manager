import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getProviderUserCounts } from '@/features/auth/actions/get-provider-user-counts'
import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    account: { groupBy: vi.fn() },
    passkey: { groupBy: vi.fn() },
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

describe('getProviderUserCounts', () => {
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
    await expect(getProviderUserCounts()).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      isAdmin: false,
    } as never)
    await expect(getProviderUserCounts()).rejects.toThrow('Keine Berechtigung')
  })

  it('should return counts for all providers', async () => {
    vi.mocked(prisma.account.groupBy)
      .mockResolvedValueOnce([{ userId: 'u1' }, { userId: 'u2' }] as never) // password
      .mockResolvedValueOnce([{ userId: 'u3' }] as never) // microsoft
      .mockResolvedValueOnce([{ userId: 'u4' }, { userId: 'u5' }] as never) // github
      .mockResolvedValueOnce([{ userId: 'u6' }] as never) // oauth
    vi.mocked(prisma.passkey.groupBy).mockResolvedValueOnce([
      { userId: 'u7' },
      { userId: 'u8' },
      { userId: 'u9' },
    ] as never)

    const result = await getProviderUserCounts()

    expect(result).toEqual({
      password: 2,
      passkey: 3,
      microsoft: 1,
      github: 2,
      oauth: 1,
    })
  })

  it('should return zeros when no users for any provider', async () => {
    vi.mocked(prisma.account.groupBy).mockResolvedValue([] as never)
    vi.mocked(prisma.passkey.groupBy).mockResolvedValue([] as never)

    const result = await getProviderUserCounts()

    expect(result).toEqual({
      password: 0,
      passkey: 0,
      microsoft: 0,
      github: 0,
      oauth: 0,
    })
  })
})
