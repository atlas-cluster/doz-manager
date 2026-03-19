import { describe, expect, it } from 'vitest'

import {
  BACKUP_CODE_PART_LENGTH,
  generateBackupCodes,
} from '@/features/auth/lib/backup-code-generate'

describe('generateBackupCodes', () => {
  it('should generate exactly 10 backup codes', () => {
    const codes = generateBackupCodes()
    expect(codes).toHaveLength(10)
  })

  it('should produce codes in PRVD-XXXX-XXXX format', () => {
    const codes = generateBackupCodes()
    const pattern = new RegExp(
      `^PRVD-[A-Z2-9]{${BACKUP_CODE_PART_LENGTH}}-[A-Z2-9]{${BACKUP_CODE_PART_LENGTH}}$`
    )

    for (const code of codes) {
      expect(code).toMatch(pattern)
    }
  })

  it('should not contain ambiguous characters (0, 1, I, O)', () => {
    const codes = generateBackupCodes()

    for (const code of codes) {
      // Remove the prefix and dashes, then check the body
      const body = code.replace('PRVD-', '').replace(/-/g, '')
      expect(body).not.toMatch(/[01IO]/)
    }
  })

  it('should generate unique codes', () => {
    const codes = generateBackupCodes()
    const unique = new Set(codes)
    // Extremely unlikely to have duplicates, but structurally valid test
    expect(unique.size).toBe(codes.length)
  })

  it('should have each code start with PRVD-', () => {
    const codes = generateBackupCodes()

    for (const code of codes) {
      expect(code.startsWith('PRVD-')).toBe(true)
    }
  })

  it('should have codes with exactly 3 parts separated by dashes', () => {
    const codes = generateBackupCodes()

    for (const code of codes) {
      const parts = code.split('-')
      expect(parts).toHaveLength(3)
      expect(parts[0]).toBe('PRVD')
      expect(parts[1]).toHaveLength(BACKUP_CODE_PART_LENGTH)
      expect(parts[2]).toHaveLength(BACKUP_CODE_PART_LENGTH)
    }
  })

  it('should produce different codes on subsequent calls', () => {
    const codes1 = generateBackupCodes()
    const codes2 = generateBackupCodes()

    // It's statistically near-impossible for all 10 codes to match
    const allSame = codes1.every((code, i) => code === codes2[i])
    expect(allSame).toBe(false)
  })
})
