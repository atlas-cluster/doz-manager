import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteUsers } from '@/features/access-control/actions/delete-users'
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

describe('deleteUsers', () => {
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

    await expect(deleteUsers(['user-1', 'user-2'])).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)

    await expect(deleteUsers(['user-1'])).rejects.toThrow('Keine Berechtigung')
  })

  it('should throw if ids include the caller', async () => {
    await expect(deleteUsers(['user-1', 'admin-1'])).rejects.toThrow(
      'Sie können sich nicht selbst löschen.'
    )
  })

  it('should call prisma.user.deleteMany with correct ids', async () => {
    await deleteUsers(['user-1', 'user-2'])

    expect(prisma.user.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['user-1', 'user-2'] } },
    })
  })

  it('should invalidate the users cache tag', async () => {
    await deleteUsers(['user-1'])

    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
