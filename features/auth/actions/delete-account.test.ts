import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteAccount } from '@/features/auth/actions/delete-account'
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

const verifyPasswordMock = vi.fn()
vi.mock('better-auth/crypto', () => ({
  verifyPassword: (args: unknown) => verifyPasswordMock(args),
}))

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
  })

  it('should throw if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    await expect(deleteAccount('password123')).rejects.toThrow(
      'Nicht authentifiziert'
    )
  })

  it('should throw if password is empty', async () => {
    await expect(deleteAccount('')).rejects.toThrow(
      'Bitte geben Sie Ihr Passwort ein.'
    )
  })

  it('should throw if no credential account found', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null as never)

    await expect(deleteAccount('password123')).rejects.toThrow(
      'Konto-Löschung fehlgeschlagen.'
    )
  })

  it('should throw if account has no password', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({
      password: null,
    } as never)

    await expect(deleteAccount('password123')).rejects.toThrow(
      'Konto-Löschung fehlgeschlagen.'
    )
  })

  it('should throw if password is incorrect', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({
      password: 'hashed-password',
    } as never)
    verifyPasswordMock.mockResolvedValue(false)

    await expect(deleteAccount('wrong-password')).rejects.toThrow(
      'Falsches Passwort.'
    )
  })

  it('should verify password with correct hash and input', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({
      password: 'hashed-password',
    } as never)
    verifyPasswordMock.mockResolvedValue(true)

    await deleteAccount('correct-password')

    expect(verifyPasswordMock).toHaveBeenCalledWith({
      hash: 'hashed-password',
      password: 'correct-password',
    })
  })

  it('should delete the user when password is valid', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({
      password: 'hashed-password',
    } as never)
    verifyPasswordMock.mockResolvedValue(true)

    await deleteAccount('correct-password')

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    })
  })

  it('should return success when account is deleted', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({
      password: 'hashed-password',
    } as never)
    verifyPasswordMock.mockResolvedValue(true)

    const result = await deleteAccount('correct-password')

    expect(result).toEqual({ success: true })
  })

  it('should look up the credential account for the session user', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null as never)

    await expect(deleteAccount('pass')).rejects.toThrow()

    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        providerId: 'credential',
      },
      select: { password: true },
    })
  })
})
