import { describe, expect, it } from 'vitest'

import { userSchema } from '@/features/access-control/schemas/user'

describe('userSchema', () => {
  const validUser = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    image: 'https://example.com/avatar.png',
    password: 'securepass123',
  }

  it('should validate a correct user object', () => {
    const result = userSchema.parse(validUser)
    expect(result).toEqual(validUser)
  })

  it('should validate without optional fields', () => {
    const minimal = { name: 'Max Mustermann', email: 'max@example.com' }
    expect(() => userSchema.parse(minimal)).not.toThrow()
  })

  describe('name', () => {
    it('should fail if name is too short', () => {
      const invalid = { ...validUser, name: 'A' }
      expect(() => userSchema.parse(invalid)).toThrow()
    })

    it('should fail if name is too long', () => {
      const invalid = { ...validUser, name: 'A'.repeat(101) }
      expect(() => userSchema.parse(invalid)).toThrow()
    })

    it('should accept name with exactly 2 characters', () => {
      const valid = { ...validUser, name: 'AB' }
      expect(() => userSchema.parse(valid)).not.toThrow()
    })

    it('should accept name with exactly 100 characters', () => {
      const valid = { ...validUser, name: 'A'.repeat(100) }
      expect(() => userSchema.parse(valid)).not.toThrow()
    })
  })

  describe('email', () => {
    it('should fail for invalid email', () => {
      const invalid = { ...validUser, email: 'not-an-email' }
      expect(() => userSchema.parse(invalid)).toThrow()
    })

    it('should accept a valid email', () => {
      const valid = { ...validUser, email: 'user@domain.de' }
      expect(() => userSchema.parse(valid)).not.toThrow()
    })
  })

  describe('image', () => {
    it('should accept null', () => {
      const valid = { ...validUser, image: null }
      expect(() => userSchema.parse(valid)).not.toThrow()
    })

    it('should accept empty string', () => {
      const valid = { ...validUser, image: '' }
      expect(() => userSchema.parse(valid)).not.toThrow()
    })

    it('should accept a valid URL', () => {
      const valid = { ...validUser, image: 'https://example.com/pic.jpg' }
      expect(() => userSchema.parse(valid)).not.toThrow()
    })

    it('should fail for invalid URL', () => {
      const invalid = { ...validUser, image: 'not-a-url' }
      expect(() => userSchema.parse(invalid)).toThrow()
    })

    it('should accept undefined (omitted)', () => {
      const { image: _, ...noImage } = validUser
      expect(() => userSchema.parse(noImage)).not.toThrow()
    })
  })

  describe('password', () => {
    it('should fail if password is too short', () => {
      const invalid = { ...validUser, password: 'short' }
      expect(() => userSchema.parse(invalid)).toThrow()
    })

    it('should fail if password is too long', () => {
      const invalid = { ...validUser, password: 'A'.repeat(129) }
      expect(() => userSchema.parse(invalid)).toThrow()
    })

    it('should accept password with exactly 8 characters', () => {
      const valid = { ...validUser, password: '12345678' }
      expect(() => userSchema.parse(valid)).not.toThrow()
    })

    it('should accept password with exactly 128 characters', () => {
      const valid = { ...validUser, password: 'A'.repeat(128) }
      expect(() => userSchema.parse(valid)).not.toThrow()
    })

    it('should be optional', () => {
      const { password: _, ...noPassword } = validUser
      expect(() => userSchema.parse(noPassword)).not.toThrow()
    })
  })
})
