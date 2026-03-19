import { describe, expect, it } from 'vitest'

import { qualificationSchema } from '@/features/lecturers/schemas/qualification'

describe('qualificationSchema', () => {
  const baseQualification = {
    experience: 'provadis' as const,
    leadTime: 'short' as const,
  }

  it('should validate a correct qualification object', () => {
    const result = qualificationSchema.parse(baseQualification)
    expect(result).toEqual(baseQualification)
  })

  describe('experience', () => {
    it('should succeed for provadis', () => {
      const valid = { ...baseQualification, experience: 'provadis' }
      expect(() => qualificationSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for other_uni', () => {
      const valid = { ...baseQualification, experience: 'other_uni' }
      expect(() => qualificationSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for none', () => {
      const valid = { ...baseQualification, experience: 'none' }
      expect(() => qualificationSchema.parse(valid)).not.toThrow()
    })

    it('should fail for invalid value', () => {
      const invalid = { ...baseQualification, experience: 'invalid' }
      expect(() => qualificationSchema.parse(invalid)).toThrow()
    })

    it('should fail for null', () => {
      const invalid = { ...baseQualification, experience: null }
      expect(() => qualificationSchema.parse(invalid)).toThrow()
    })

    it('should fail when missing', () => {
      const invalid = { leadTime: 'short' }
      expect(() => qualificationSchema.parse(invalid)).toThrow()
    })
  })

  describe('leadTime', () => {
    it('should succeed for short', () => {
      const valid = { ...baseQualification, leadTime: 'short' }
      expect(() => qualificationSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for four_weeks', () => {
      const valid = { ...baseQualification, leadTime: 'four_weeks' }
      expect(() => qualificationSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for more_weeks', () => {
      const valid = { ...baseQualification, leadTime: 'more_weeks' }
      expect(() => qualificationSchema.parse(valid)).not.toThrow()
    })

    it('should fail for invalid value', () => {
      const invalid = { ...baseQualification, leadTime: 'invalid' }
      expect(() => qualificationSchema.parse(invalid)).toThrow()
    })

    it('should fail for null', () => {
      const invalid = { ...baseQualification, leadTime: null }
      expect(() => qualificationSchema.parse(invalid)).toThrow()
    })

    it('should fail when missing', () => {
      const invalid = { experience: 'provadis' }
      expect(() => qualificationSchema.parse(invalid)).toThrow()
    })
  })
})
