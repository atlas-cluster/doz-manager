import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  dispatchUserProfileUpdated,
  USER_PROFILE_UPDATED_EVENT,
  type UserProfileUpdatedDetail,
} from '@/features/shared/lib/user-profile-sync'

describe('user-profile-sync', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should export the correct event name', () => {
    expect(USER_PROFILE_UPDATED_EVENT).toBe('app:user-profile-updated')
  })

  it('should dispatch a CustomEvent with the provided detail', () => {
    const spy = vi.spyOn(window, 'dispatchEvent')

    const detail: UserProfileUpdatedDetail = {
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      twoFactorEnabled: false,
    }

    dispatchUserProfileUpdated(detail)

    expect(spy).toHaveBeenCalledTimes(1)
    const event = spy.mock.calls[0][0] as CustomEvent<UserProfileUpdatedDetail>
    expect(event.type).toBe(USER_PROFILE_UPDATED_EVENT)
    expect(event.detail).toEqual(detail)
  })

  it('should include optional backupCodeCount in detail', () => {
    const spy = vi.spyOn(window, 'dispatchEvent')

    const detail: UserProfileUpdatedDetail = {
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.png',
      twoFactorEnabled: true,
      backupCodeCount: 5,
    }

    dispatchUserProfileUpdated(detail)

    const event = spy.mock.calls[0][0] as CustomEvent<UserProfileUpdatedDetail>
    expect(event.detail.backupCodeCount).toBe(5)
  })

  it('should include optional hasPasskey in detail', () => {
    const spy = vi.spyOn(window, 'dispatchEvent')

    const detail: UserProfileUpdatedDetail = {
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      twoFactorEnabled: false,
      hasPasskey: true,
    }

    dispatchUserProfileUpdated(detail)

    const event = spy.mock.calls[0][0] as CustomEvent<UserProfileUpdatedDetail>
    expect(event.detail.hasPasskey).toBe(true)
  })

  it('should include optional authProviders in detail', () => {
    const spy = vi.spyOn(window, 'dispatchEvent')

    const detail: UserProfileUpdatedDetail = {
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      twoFactorEnabled: false,
      authProviders: ['credential', 'passkey', 'microsoft'],
    }

    dispatchUserProfileUpdated(detail)

    const event = spy.mock.calls[0][0] as CustomEvent<UserProfileUpdatedDetail>
    expect(event.detail.authProviders).toEqual([
      'credential',
      'passkey',
      'microsoft',
    ])
  })
})
