import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  isSupportedUpdateScope,
  publishScopeUpdate,
  subscribeToScopeUpdates,
} from '@/features/shared/lib/update-stream'

const getSessionMock = vi.fn()
const headersMock = vi.fn()

vi.mock('next/headers', () => ({
  headers: headersMock,
}))

vi.mock('@/features/auth/lib/auth', () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}))

describe('update-stream', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    headersMock.mockResolvedValue(new Headers())
    getSessionMock.mockResolvedValue({
      user: { id: 'user-1' },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should validate supported scopes', () => {
    expect(isSupportedUpdateScope('lecturers')).toBe(true)
    expect(isSupportedUpdateScope('courses')).toBe(true)
    expect(isSupportedUpdateScope('users')).toBe(true)
    expect(isSupportedUpdateScope('reports')).toBe(false)
    expect(isSupportedUpdateScope('settings')).toBe(false)
  })

  it('should notify listeners with actor user id payload', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToScopeUpdates('users', listener)

    publishScopeUpdate('users')

    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith({ actorUserId: 'user-1' })
    })

    unsubscribe()
  })

  it('should stop notifying listeners after unsubscribe', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToScopeUpdates('courses', listener)
    unsubscribe()

    publishScopeUpdate('courses')

    await vi.waitFor(() => {
      expect(listener).not.toHaveBeenCalled()
    })
  })

  it('should continue notifying remaining listeners when one throws', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const throwingListener = vi.fn(() => {
      throw new Error('boom')
    })
    const healthyListener = vi.fn()
    const unsubscribeThrowing = subscribeToScopeUpdates(
      'lecturers',
      throwingListener
    )
    const unsubscribeHealthy = subscribeToScopeUpdates(
      'lecturers',
      healthyListener
    )

    publishScopeUpdate('lecturers')

    await vi.waitFor(() => {
      expect(throwingListener).toHaveBeenCalledTimes(1)
      expect(healthyListener).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to notify update listener',
        expect.any(Error)
      )
    })

    unsubscribeThrowing()
    unsubscribeHealthy()
  })
})
