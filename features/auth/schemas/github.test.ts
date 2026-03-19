import { describe, expect, it } from 'vitest'

import { githubSchema } from '@/features/auth/schemas/github'

describe('githubSchema', () => {
  it('should accept valid data', () => {
    const result = githubSchema.safeParse({
      clientId: 'some-client-id',
      clientSecret: 'some-secret',
    })
    expect(result.success).toBe(true)
  })

  it('should require clientId', () => {
    const result = githubSchema.safeParse({
      clientId: '',
      clientSecret: '',
    })
    expect(result.success).toBe(false)
  })

  it('should allow empty clientSecret', () => {
    const result = githubSchema.safeParse({
      clientId: 'id',
      clientSecret: '',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing clientId field', () => {
    const result = githubSchema.safeParse({
      clientSecret: 'secret',
    })
    expect(result.success).toBe(false)
  })
})
