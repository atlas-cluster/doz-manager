import { describe, expect, it } from 'vitest'

import {
  formatBackupCode,
  formatBackupCodes,
  toCanonicalBackupCode,
} from '@/features/auth/lib/backup-code-format'

describe('backup-code-format', () => {
  it('formats raw backup code values to canonical PRVD format', () => {
    expect(formatBackupCode('abc1-def3')).toBe('PRVD-ABC1-DEF3')
  })

  it('keeps already canonical codes unchanged', () => {
    expect(formatBackupCode('PRVD-AB12-CD34')).toBe('PRVD-AB12-CD34')
  })

  it('returns null for invalid canonical conversion input', () => {
    expect(toCanonicalBackupCode('abc')).toBeNull()
  })

  it('formats a list of codes', () => {
    expect(formatBackupCodes(['abc1-def3', 'PRVD-AB12-CD34'])).toEqual([
      'PRVD-ABC1-DEF3',
      'PRVD-AB12-CD34',
    ])
  })
})
