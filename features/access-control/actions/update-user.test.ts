import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateUser } from '@/features/access-control/actions/update-user'
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

describe('updateUser', () => {
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

    await expect(
      updateUser('user-1', { name: 'New Name', email: 'new@example.com' })
    ).rejects.toThrow('Nicht authentifiziert')
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)

    await expect(
      updateUser('user-1', { name: 'New Name', email: 'new@example.com' })
    ).rejects.toThrow('Keine Berechtigung')
  })

  it('should call prisma.user.update with correct data', async () => {
    await updateUser('user-1', {
      name: 'New Name',
      email: 'new@example.com',
      image: 'https://example.com/avatar.png',
    })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        name: 'New Name',
        email: 'new@example.com',
        image: 'https://example.com/avatar.png',
      },
    })
  })

  it('should set image to null when empty string', async () => {
    await updateUser('user-1', {
      name: 'New Name',
      email: 'new@example.com',
      image: '',
    })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        name: 'New Name',
        email: 'new@example.com',
        image: null,
      },
    })
  })

  it('should set image to undefined when not provided', async () => {
    await updateUser('user-1', {
      name: 'New Name',
      email: 'new@example.com',
    })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        name: 'New Name',
        email: 'new@example.com',
        image: undefined,
      },
    })
  })

  it('should invalidate the users cache tag', async () => {
    await updateUser('user-1', { name: 'New Name', email: 'new@example.com' })

    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
