import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getHasPassword } from '@/features/auth/actions/get-has-password'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma', () => ({
  prisma: {
    account: { findFirst: vi.fn() },
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

describe('getHasPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false when user is not authenticated', async () => {
    const { auth } = await import('@/features/auth/lib/auth')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never)

    const result = await getHasPassword()

    expect(result).toBe(false)
  })

  it('should return true when user has a credential account', async () => {
    const { auth } = await import('@/features/auth/lib/auth')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.account.findFirst).mockResolvedValueOnce({
      id: 'acc-1',
    } as never)

    const result = await getHasPassword()

    expect(result).toBe(true)
    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', providerId: 'credential' },
      select: { id: true },
    })
  })

  it('should return false when user has no credential account', async () => {
    const { auth } = await import('@/features/auth/lib/auth')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.account.findFirst).mockResolvedValueOnce(null as never)

    const result = await getHasPassword()

    expect(result).toBe(false)
  })
})
