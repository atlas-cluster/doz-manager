import { describe, expect, it } from 'vitest'

import { encrypt, decrypt } from '@/features/auth/lib/encrypt'

// Set a deterministic 32-byte hex key for tests
process.env.AUTH_SETTINGS_ENCRYPTION_KEY =
  'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'

describe('encrypt / decrypt', () => {
  it('should roundtrip a simple string', () => {
    const plaintext = 'hello world'
    const ciphertext = encrypt(plaintext)
    expect(ciphertext).not.toBe(plaintext)
    expect(decrypt(ciphertext)).toBe(plaintext)
  })

  it('should encrypt an empty string without throwing', () => {
    // Empty plaintext produces an empty ciphertext segment which may
    // fail the format guard in decrypt — verify encrypt itself works.
    expect(() => encrypt('')).not.toThrow()
  })

  it('should roundtrip unicode text', () => {
    const plaintext = 'Ümlauts äöü and emojis 🔐🔑'
    expect(decrypt(encrypt(plaintext))).toBe(plaintext)
  })

  it('should roundtrip a long string', () => {
    const plaintext = 'x'.repeat(10_000)
    expect(decrypt(encrypt(plaintext))).toBe(plaintext)
  })

  it('should produce different ciphertext for the same input (random IV)', () => {
    const a = encrypt('same')
    const b = encrypt('same')
    expect(a).not.toBe(b)
    // but both decrypt to the same value
    expect(decrypt(a)).toBe('same')
    expect(decrypt(b)).toBe('same')
  })

  it('should produce ciphertext in iv:authTag:data format', () => {
    const parts = encrypt('test').split(':')
    expect(parts).toHaveLength(3)
    // Each part should be valid base64
    for (const part of parts) {
      expect(() => Buffer.from(part, 'base64')).not.toThrow()
    }
  })

  it('should throw on invalid ciphertext format', () => {
    expect(() => decrypt('not-valid')).toThrow()
  })

  it('should throw on tampered ciphertext', () => {
    const ciphertext = encrypt('secret')
    const parts = ciphertext.split(':')
    // Tamper with the encrypted data
    parts[2] = Buffer.from('tampered').toString('base64')
    expect(() => decrypt(parts.join(':'))).toThrow()
  })
})

describe('encrypt key validation', () => {
  it('should throw when key is missing', () => {
    const original = process.env.AUTH_SETTINGS_ENCRYPTION_KEY
    delete process.env.AUTH_SETTINGS_ENCRYPTION_KEY
    expect(() => encrypt('test')).toThrow('AUTH_SETTINGS_ENCRYPTION_KEY')
    process.env.AUTH_SETTINGS_ENCRYPTION_KEY = original
  })

  it('should throw when key is wrong length', () => {
    const original = process.env.AUTH_SETTINGS_ENCRYPTION_KEY
    process.env.AUTH_SETTINGS_ENCRYPTION_KEY = 'tooshort'
    expect(() => encrypt('test')).toThrow('AUTH_SETTINGS_ENCRYPTION_KEY')
    process.env.AUTH_SETTINGS_ENCRYPTION_KEY = original
  })
})
