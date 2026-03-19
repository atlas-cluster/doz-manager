import { describe, expect, it } from 'vitest'

import { encrypt, decrypt } from '@/features/auth/lib/encrypt'

// Set a test secret (any string works — Better Auth hashes it internally)
process.env.BETTER_AUTH_SECRET = 'test-secret-for-encrypt-tests'

describe('encrypt / decrypt', () => {
  it('should roundtrip a simple string', async () => {
    const plaintext = 'hello world'
    const ciphertext = await encrypt(plaintext)
    expect(ciphertext).not.toBe(plaintext)
    expect(await decrypt(ciphertext)).toBe(plaintext)
  })

  it('should encrypt an empty string without throwing', async () => {
    await expect(encrypt('')).resolves.toBeDefined()
  })

  it('should roundtrip unicode text', async () => {
    const plaintext = 'Ümlauts äöü and emojis 🔐🔑'
    expect(await decrypt(await encrypt(plaintext))).toBe(plaintext)
  })

  it('should roundtrip a long string', async () => {
    const plaintext = 'x'.repeat(10_000)
    expect(await decrypt(await encrypt(plaintext))).toBe(plaintext)
  })

  it('should produce different ciphertext for the same input (random nonce)', async () => {
    const a = await encrypt('same')
    const b = await encrypt('same')
    expect(a).not.toBe(b)
    // but both decrypt to the same value
    expect(await decrypt(a)).toBe('same')
    expect(await decrypt(b)).toBe('same')
  })

  it('should throw on tampered ciphertext', async () => {
    const ciphertext = await encrypt('secret')
    const tampered = ciphertext.slice(0, -4) + 'xxxx'
    await expect(decrypt(tampered)).rejects.toThrow()
  })
})

describe('encrypt key validation', () => {
  it('should throw when key is missing', async () => {
    const original = process.env.BETTER_AUTH_SECRET
    delete process.env.BETTER_AUTH_SECRET
    delete process.env.AUTH_SECRET
    await expect(encrypt('test')).rejects.toThrow(
      'Missing BETTER_AUTH_SECRET or AUTH_SECRET'
    )
    process.env.BETTER_AUTH_SECRET = original
  })
})
