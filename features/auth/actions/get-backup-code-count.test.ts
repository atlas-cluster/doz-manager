import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getBackupCodeCount } from '@/features/auth/actions/get-backup-code-count'
import { auth } from '@/features/auth/lib/auth'

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))
vi.mock('@/features/auth/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      viewBackupCodes: vi.fn(),
    },
  },
}))

describe('getBackupCodeCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    const result = await getBackupCodeCount()

    expect(result).toBeNull()
  })

  it('should return the number of backup codes', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(auth.api.viewBackupCodes).mockResolvedValue({
      backupCodes: ['code1', 'code2', 'code3'],
    } as never)

    const result = await getBackupCodeCount()

    expect(result).toBe(3)
  })

  it('should return null when backupCodes is undefined', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(auth.api.viewBackupCodes).mockResolvedValue({} as never)

    const result = await getBackupCodeCount()

    expect(result).toBeNull()
  })

  it('should return null when result is null', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(auth.api.viewBackupCodes).mockResolvedValue(null as never)

    const result = await getBackupCodeCount()

    expect(result).toBeNull()
  })

  it('should return 0 when backup codes array is empty', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(auth.api.viewBackupCodes).mockResolvedValue({
      backupCodes: [],
    } as never)

    const result = await getBackupCodeCount()

    expect(result).toBe(0)
  })

  it('should return null when an error occurs', async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Network error'))

    const result = await getBackupCodeCount()

    expect(result).toBeNull()
  })

  it('should call viewBackupCodes with the correct userId', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-42' },
    } as never)
    vi.mocked(auth.api.viewBackupCodes).mockResolvedValue({
      backupCodes: [],
    } as never)

    await getBackupCodeCount()

    expect(auth.api.viewBackupCodes).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { userId: 'user-42' },
      })
    )
  })
})
