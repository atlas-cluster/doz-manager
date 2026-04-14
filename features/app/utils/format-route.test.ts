import { describe, expect, it } from 'vitest'

import { formatRoute } from '@/features/app/utils/format-route'

describe('formatRoute', () => {
  it('should return "Dozenten" for /lecturers', () => {
    expect(formatRoute('/lecturers')).toBe('Dozenten')
  })

  it('should return "Vorlesungen" for /courses', () => {
    expect(formatRoute('/courses')).toBe('Vorlesungen')
  })

  it('should return "Benutzerverwaltung" for /access-control', () => {
    expect(formatRoute('/access-control')).toBe('Benutzerverwaltung')
  })

  it('should return "Einstellungen" for /settings', () => {
    expect(formatRoute('/settings')).toBe('Einstellungen')
  })

  it('should return "Dashboard" for unknown routes', () => {
    expect(formatRoute('/')).toBe('Dashboard')
    expect(formatRoute('/unknown')).toBe('Dashboard')
    expect(formatRoute('')).toBe('Dashboard')
  })
})
