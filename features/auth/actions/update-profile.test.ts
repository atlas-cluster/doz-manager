import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateProfile } from '@/features/auth/actions/update-profile'
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

const mockUpdatedUser = {
  id: 'user-1',
  name: 'Updated Name',
  email: 'updated@example.com',
  image: null,
  twoFactorEnabled: false,
}

describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as never)
  })

  it('should return error when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never)

    const result = await updateProfile({ name: 'New Name' })

    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('should return error for empty name after trimming', async () => {
    const result = await updateProfile({ name: '   ' })

    expect(result).toEqual({ error: 'Invalid name' })
  })

  it('should return error for empty email after trimming', async () => {
    const result = await updateProfile({ email: '   ' })

    expect(result).toEqual({ error: 'Invalid email' })
  })

  it('should update name successfully', async () => {
    const result = await updateProfile({ name: 'Updated Name' })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: { name: 'Updated Name' },
      })
    )
    expect(result.user).toBeDefined()
  })

  it('should update email successfully', async () => {
    await updateProfile({ email: 'updated@example.com' })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { email: 'updated@example.com' },
      })
    )
  })

  it('should trim whitespace from name and email', async () => {
    await updateProfile({
      name: '  Trimmed Name  ',
      email: '  trimmed@test.com  ',
    })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'Trimmed Name', email: 'trimmed@test.com' },
      })
    )
  })

  it('should set image to null when explicitly null', async () => {
    await updateProfile({ image: null })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { image: null },
      })
    )
  })

  it('should set image to null for empty string', async () => {
    await updateProfile({ image: '' })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { image: null },
      })
    )
  })

  it('should set image to null for whitespace-only string', async () => {
    await updateProfile({ image: '   ' })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { image: null },
      })
    )
  })

  it('should trim and keep a valid image URL', async () => {
    await updateProfile({ image: '  https://example.com/avatar.png  ' })

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { image: 'https://example.com/avatar.png' },
      })
    )
  })

  it('should not include undefined fields in the update data', async () => {
    await updateProfile({ name: 'Only Name' })

    const updateCall = vi.mocked(prisma.user.update).mock.calls[0][0]
    expect(updateCall.data).toEqual({ name: 'Only Name' })
    expect(updateCall.data).not.toHaveProperty('email')
    expect(updateCall.data).not.toHaveProperty('image')
  })

  it('should return user data on successful update', async () => {
    const result = await updateProfile({ name: 'Updated Name' })

    expect(result).toEqual({
      user: {
        id: 'user-1',
        name: 'Updated Name',
        email: 'updated@example.com',
        image: null,
        twoFactorEnabled: false,
      },
    })
  })

  it('should return error when prisma throws', async () => {
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('DB error'))

    const result = await updateProfile({ name: 'New Name' })

    expect(result).toEqual({ error: 'Failed to update profile' })
  })
})
