import { updateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { invalidateUsersCache } from '@/features/access-control/actions/invalidate-users-cache'

vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('invalidateUsersCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call updateTag with "users"', async () => {
    await invalidateUsersCache()

    expect(updateTag).toHaveBeenCalledWith('users')
    expect(updateTag).toHaveBeenCalledTimes(1)
  })
})
