import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { toggleAdmin } from '@/features/access-control/actions/toggle-admin'
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

describe('toggleAdmin', () => {
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

    await expect(toggleAdmin('user-1', true)).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if caller is not admin', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isAdmin: false,
    } as never)

    await expect(toggleAdmin('user-1', true)).rejects.toThrow(
      'Keine Berechtigung'
    )
  })

  it('should throw if trying to remove own admin rights', async () => {
    await expect(toggleAdmin('admin-1', false)).rejects.toThrow(
      'Sie können sich nicht selbst die Adminrechte entziehen.'
    )
  })

  it('should not throw if setting own admin to true', async () => {
    await expect(toggleAdmin('admin-1', true)).resolves.not.toThrow()
  })

  it('should call prisma.user.update to grant admin', async () => {
    await toggleAdmin('user-1', true)

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isAdmin: true },
    })
  })

  it('should call prisma.user.update to revoke admin', async () => {
    await toggleAdmin('user-1', false)

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isAdmin: false },
    })
  })

  it('should invalidate the users cache tag', async () => {
    await toggleAdmin('user-1', true)

    expect(updateTag).toHaveBeenCalledWith('users')
  })
})
