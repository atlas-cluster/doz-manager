import { describe, expect, it } from 'vitest'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'

describe('lecturerSchema', () => {
  it('should validate a correct lecturer object', () => {
    const validLecturer = {
      title: 'Dr.',
      firstName: 'John',
      secondName: 'A.',
      lastName: 'Doe',
      email: 'mail@johndoe.com',
      phone: '+1234567890',
      type: 'internal',
      courseLevelPreference: 'both',
    }

    const result = lecturerSchema.parse(validLecturer)
    expect(result).toEqual(validLecturer)
  })

  it('should validate a lecturer object with null values for optional fields', () => {
    const lecturerWithNulls = {
      title: null,
      firstName: 'Jane',
      secondName: null,
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      type: 'external',
      courseLevelPreference: 'bachelor',
    }

    const result = lecturerSchema.parse(lecturerWithNulls)
    expect(result).toEqual(lecturerWithNulls)
  })

  describe('should validate fields', () => {
    const baseLecturer = {
      title: 'Dr.',
      firstName: 'John',
      secondName: 'A.',
      lastName: 'Doe',
      email: 'mail@johndoe.com',
      phone: '+1234567890',
      type: 'internal',
      courseLevelPreference: 'both',
    }

    describe('title', () => {
      it('should succeed for valid title', () => {
        const valid = { ...baseLecturer, title: 'Prof. Dr.' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should fail if title is longer than 20 characters', () => {
        const invalid = { ...baseLecturer, title: 'A'.repeat(21) }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if title contains invalid characters', () => {
        const invalid = { ...baseLecturer, title: 'Dr. @' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should pass if title is null', () => {
        const valid = { ...baseLecturer, title: null }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })
    })

    describe('firstName', () => {
      it('should fail if firstName is empty', () => {
        const invalid = { ...baseLecturer, firstName: '' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should succeed for valid firstName', () => {
        const valid = { ...baseLecturer, firstName: 'Alice' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should succeed for firstName with accented characters', () => {
        const valid = { ...baseLecturer, firstName: 'Élise' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should fail if firstName is null', () => {
        const invalid = { ...baseLecturer, firstName: null }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if firstName is longer than 50 characters', () => {
        const invalid = { ...baseLecturer, firstName: 'A'.repeat(51) }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if firstName contains invalid characters', () => {
        const invalid = { ...baseLecturer, firstName: 'John123' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })
    })

    describe('secondName', () => {
      it('should fail if secondName is longer than 50 characters', () => {
        const invalid = { ...baseLecturer, secondName: 'A'.repeat(51) }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if secondName contains invalid characters', () => {
        const invalid = { ...baseLecturer, secondName: 'A. #' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })
    })

    describe('lastName', () => {
      it('should fail if lastName is empty', () => {
        const invalid = { ...baseLecturer, lastName: '' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if lastName is longer than 50 characters', () => {
        const invalid = { ...baseLecturer, lastName: 'A'.repeat(51) }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if lastName contains invalid characters', () => {
        const invalid = { ...baseLecturer, lastName: 'Doe!' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })
    })

    describe('email', () => {
      it('should succeed for valid email', () => {
        const valid = { ...baseLecturer, email: 'mail@johndoe.com' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should fail if email is empty', () => {
        const invalid = { ...baseLecturer, email: '' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if email is null', () => {
        const invalid = { ...baseLecturer, email: null }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if email is invalid', () => {
        const invalid = { ...baseLecturer, email: 'not-an-email' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })
    })

    describe('phone', () => {
      it('should succeed for valid phone number with plus sign', () => {
        const valid = { ...baseLecturer, phone: '+1234567890' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should succeed for valid phone number without plus sign', () => {
        const valid = { ...baseLecturer, phone: '1234567890' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should fail if phone contains whitespaces', () => {
        const invalid = { ...baseLecturer, phone: '12 3456789' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if phone is empty', () => {
        const invalid = { ...baseLecturer, phone: '' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if phone is longer than 20 characters', () => {
        const invalid = { ...baseLecturer, phone: '1'.repeat(21) }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if phone contains invalid characters', () => {
        const invalid = { ...baseLecturer, phone: '123-456' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if phone is null', () => {
        const invalid = { ...baseLecturer, phone: null }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })
    })

    describe('type', () => {
      it('should succeed for internal value', () => {
        const valid = { ...baseLecturer, type: 'internal' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should succeed for external value', () => {
        const valid = { ...baseLecturer, type: 'external' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should fail if type is invalid', () => {
        const invalid = { ...baseLecturer, type: 'invalid-type' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if type is null', () => {
        const invalid = { ...baseLecturer, type: null }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })
    })

    describe('courseLevelPreference', () => {
      it('should succeed for masters value', () => {
        const valid = { ...baseLecturer, courseLevelPreference: 'master' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should succeed for bachelors value', () => {
        const valid = { ...baseLecturer, courseLevelPreference: 'bachelor' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should succeed for both value', () => {
        const valid = { ...baseLecturer, courseLevelPreference: 'both' }
        expect(() => lecturerSchema.parse(valid)).not.toThrow()
      })

      it('should fail if courseLevelPreference is invalid', () => {
        const invalid = { ...baseLecturer, courseLevelPreference: 'phd' }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })

      it('should fail if courseLevelPreference is null', () => {
        const invalid = { ...baseLecturer, courseLevelPreference: null }
        expect(() => lecturerSchema.parse(invalid)).toThrow()
      })
    })
  })
})
