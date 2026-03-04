import { describe, expect, it } from 'vitest'

import { courseSchema } from '@/features/courses/schemas/course'

describe('courseSchema', () => {
  const baseCourse = {
    name: 'Mathematik',
    isOpen: true,
    courseLevel: 'bachelor' as const,
    semester: 1,
  }

  it('should validate a correct course object', () => {
    const result = courseSchema.parse(baseCourse)
    expect(result).toEqual(baseCourse)
  })

  it('should validate a course with null semester', () => {
    const course = { ...baseCourse, semester: null }
    const result = courseSchema.parse(course)
    expect(result).toEqual(course)
  })

  describe('name', () => {
    it('should fail if name is shorter than 2 characters', () => {
      const invalid = { ...baseCourse, name: 'A' }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should fail if name is empty', () => {
      const invalid = { ...baseCourse, name: '' }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should fail if name is longer than 50 characters', () => {
      const invalid = { ...baseCourse, name: 'A'.repeat(51) }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should succeed for name with exactly 2 characters', () => {
      const valid = { ...baseCourse, name: 'Ab' }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for name with exactly 50 characters', () => {
      const valid = { ...baseCourse, name: 'A'.repeat(50) }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for name with numbers', () => {
      const valid = { ...baseCourse, name: 'Mathematik 2' }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for name with hyphens and apostrophes', () => {
      const valid = { ...baseCourse, name: "Mathe-Grundlagen d'Test" }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should fail for name with special characters', () => {
      const invalid = { ...baseCourse, name: 'Mathe@Kurs!' }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should succeed for name with accented characters', () => {
      const valid = { ...baseCourse, name: 'Übungen Physik' }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })
  })

  describe('isOpen', () => {
    it('should succeed for true', () => {
      const valid = { ...baseCourse, isOpen: true }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for false', () => {
      const valid = { ...baseCourse, isOpen: false }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should fail for non-boolean values', () => {
      const invalid = { ...baseCourse, isOpen: 'yes' }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should fail for null', () => {
      const invalid = { ...baseCourse, isOpen: null }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })
  })

  describe('courseLevel', () => {
    it('should succeed for bachelor', () => {
      const valid = { ...baseCourse, courseLevel: 'bachelor' }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for master', () => {
      const valid = { ...baseCourse, courseLevel: 'master' }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should fail for invalid value', () => {
      const invalid = { ...baseCourse, courseLevel: 'phd' }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should fail for null', () => {
      const invalid = { ...baseCourse, courseLevel: null }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })
  })

  describe('semester', () => {
    it('should succeed for valid semester', () => {
      const valid = { ...baseCourse, semester: 6 }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for semester 1 (minimum)', () => {
      const valid = { ...baseCourse, semester: 1 }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should succeed for semester 12 (maximum)', () => {
      const valid = { ...baseCourse, semester: 12 }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })

    it('should fail for semester 0', () => {
      const invalid = { ...baseCourse, semester: 0 }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should fail for semester 13', () => {
      const invalid = { ...baseCourse, semester: 13 }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should fail for negative semester', () => {
      const invalid = { ...baseCourse, semester: -1 }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should fail for non-integer semester', () => {
      const invalid = { ...baseCourse, semester: 2.5 }
      expect(() => courseSchema.parse(invalid)).toThrow()
    })

    it('should succeed for null semester', () => {
      const valid = { ...baseCourse, semester: null }
      expect(() => courseSchema.parse(valid)).not.toThrow()
    })
  })
})
