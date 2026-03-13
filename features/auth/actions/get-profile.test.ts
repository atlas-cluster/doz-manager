import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getProfile } from '@/features/auth/actions/get-profile'
import { auth } from '@/features/auth/lib/auth'
import { prisma } from '@/features/shared/lib/prisma'

vi.mock('@/features/shared/lib/prisma')
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

describe('getProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    const result = await getProfile()

    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('should return error when user is not found in database', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never)

    const result = await getProfile()

    expect(result).toEqual({ error: 'User not found' })
  })

  it('should return user data when authenticated and found', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.png',
      twoFactorEnabled: true,
    } as never)

    const result = await getProfile()

    expect(result).toEqual({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.png',
        twoFactorEnabled: true,
      },
    })
  })

  it('should normalize null image', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      twoFactorEnabled: false,
    } as never)

    const result = await getProfile()

    expect(result.user?.image).toBeNull()
    expect(result.user?.twoFactorEnabled).toBe(false)
  })

  it('should coerce twoFactorEnabled to boolean', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      twoFactorEnabled: 0,
    } as never)

    const result = await getProfile()

    expect(result.user?.twoFactorEnabled).toBe(false)
  })

  it('should return error when an exception is thrown', async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error('DB failure'))

    const result = await getProfile()

    expect(result).toEqual({ error: 'Failed to get profile' })
  })

  it('should query prisma with the session user id', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-42' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never)

    await getProfile()

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-42' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        twoFactorEnabled: true,
      },
    })
  })
})
