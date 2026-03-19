import { describe, expect, it } from 'vitest'

import { microsoftSchema } from '@/features/auth/schemas/microsoft'

describe('microsoftSchema', () => {
  it('should accept valid data', () => {
    const result = microsoftSchema.safeParse({
      clientId: 'some-client-id',
      clientSecret: 'some-secret',
      tenantId: 'some-tenant-id',
    })
    expect(result.success).toBe(true)
  })

  it('should require clientId', () => {
    const result = microsoftSchema.safeParse({
      clientId: '',
      clientSecret: '',
      tenantId: 'tenant',
    })
    expect(result.success).toBe(false)
  })

  it('should require tenantId', () => {
    const result = microsoftSchema.safeParse({
      clientId: 'id',
      clientSecret: '',
      tenantId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should allow empty clientSecret', () => {
    const result = microsoftSchema.safeParse({
      clientId: 'id',
      clientSecret: '',
      tenantId: 'tenant',
    })
    expect(result.success).toBe(true)
  })
})
