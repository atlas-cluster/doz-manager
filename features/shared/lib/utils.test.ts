import { describe, expect, it } from 'vitest'

import { cn, initialsFromName } from '@/features/shared/lib/utils'

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge conflicting tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('should handle undefined and null inputs', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })
})

describe('initialsFromName', () => {
  it('should return initials from two-word name', () => {
    expect(initialsFromName('Jeremy Doe')).toBe('JD')
  })

  it('should return first two letters for single-word name', () => {
    expect(initialsFromName('Jeremy')).toBe('JE')
  })

  it('should return first and last initials for multi-word name', () => {
    expect(initialsFromName('John Michael Doe')).toBe('JD')
  })

  it('should return "?" for undefined', () => {
    expect(initialsFromName(undefined)).toBe('?')
  })

  it('should return "?" for empty string', () => {
    expect(initialsFromName('')).toBe('?')
  })

  it('should return "?" for whitespace-only string', () => {
    expect(initialsFromName('   ')).toBe('?')
  })

  it('should uppercase the result', () => {
    expect(initialsFromName('john doe')).toBe('JD')
  })

  it('should respect custom maxLetters for single word', () => {
    expect(initialsFromName('Jeremy', 3)).toBe('JER')
  })

  it('should handle extra whitespace', () => {
    expect(initialsFromName('  John   Doe  ')).toBe('JD')
  })
})
