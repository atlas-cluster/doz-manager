import { describe, expect, it } from 'vitest'

import { oauthSchema } from '@/features/auth/schemas/oauth'

describe('oauthSchema', () => {
  it('should accept valid data', () => {
    const result = oauthSchema.safeParse({
      clientId: 'some-client-id',
      clientSecret: 'some-secret',
      issuerUrl: 'https://auth.example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should require clientId', () => {
    const result = oauthSchema.safeParse({
      clientId: '',
      clientSecret: '',
      issuerUrl: 'https://auth.example.com',
    })
    expect(result.success).toBe(false)
  })

  it('should require a valid URL for issuerUrl', () => {
    const result = oauthSchema.safeParse({
      clientId: 'id',
      clientSecret: '',
      issuerUrl: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('should allow empty clientSecret', () => {
    const result = oauthSchema.safeParse({
      clientId: 'id',
      clientSecret: '',
      issuerUrl: 'https://auth.example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing issuerUrl', () => {
    const result = oauthSchema.safeParse({
      clientId: 'id',
      clientSecret: '',
    })
    expect(result.success).toBe(false)
  })
})
