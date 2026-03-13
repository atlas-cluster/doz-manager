import { beforeEach, describe, expect, it, vi } from 'vitest'

import { requireAdmin } from '@/features/access-control/lib/require-admin'
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

// Mock next/navigation redirect to throw (as it does in real Next.js)
const redirectMock = vi.fn().mockImplementation((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`)
})
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}))

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect to /login if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('should redirect to / if user is not admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)

    await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT:/')
    expect(redirectMock).toHaveBeenCalledWith('/')
  })

  it('should redirect to / if user is not found', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never)

    await expect(requireAdmin()).rejects.toThrow('NEXT_REDIRECT:/')
    expect(redirectMock).toHaveBeenCalledWith('/')
  })

  it('should return the session if user is admin', async () => {
    const session = { user: { id: 'admin-1' } }
    vi.mocked(auth.api.getSession).mockResolvedValue(session as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: true,
    } as never)

    const result = await requireAdmin()

    expect(result).toEqual(session)
  })

  it('should check the correct user by session id', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-42' },
    } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: true,
    } as never)

    await requireAdmin()

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-42' },
      select: { isAdmin: true },
    })
  })
})
