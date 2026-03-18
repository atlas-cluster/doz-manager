import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReportCardCoursesWithoutProvadisExperience } from '@/features/reports/components/card/courses-without-provadis-experience'
import * as utils from '@/features/reports/utils'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))
vi.mock('@/features/reports/utils', () => ({
  downloadCSV: vi.fn(),
  downloadJSON: vi.fn(),
  generatePDF: vi.fn().mockResolvedValue({
    doc: { save: vi.fn() },
    contentStartY: 40,
  }),
}))
vi.mock('@/features/reports/components/report-card-export-dropdown', () => ({
  ReportCardExportDropdown: ({
    onExportPDF,
    onExportJSON,
    onExportCSV,
  }: {
    onExportPDF?: () => void
    onExportJSON?: () => void
    onExportCSV?: () => void
  }) =>
    React.createElement('div', { 'data-testid': 'export-dropdown' }, [
      React.createElement(
        'button',
        { key: 'pdf', onClick: onExportPDF },
        'PDF'
      ),
      React.createElement(
        'button',
        { key: 'json', onClick: onExportJSON },
        'JSON'
      ),
      React.createElement(
        'button',
        { key: 'csv', onClick: onExportCSV },
        'CSV'
      ),
    ]),
}))

const mockCourses = ['Biologie', 'Chemie', 'Kunst']

describe('ReportCardCoursesWithoutProvadisExperience', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the card title and description', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={mockCourses} />)

    expect(
      screen.getByText('Vorlesungen ohne Provadis-Erfahrung')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Alle Vorlesungen, für die kein Dozent mit Provadis-Erfahrung verfügbar ist'
      )
    ).toBeInTheDocument()
  })

  it('should render the course count badge', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={mockCourses} />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should render all courses in the table', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={mockCourses} />)

    expect(screen.getByText('Biologie')).toBeInTheDocument()
    expect(screen.getByText('Chemie')).toBeInTheDocument()
    expect(screen.getByText('Kunst')).toBeInTheDocument()
  })

  it('should render the table header', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={mockCourses} />)

    expect(screen.getByText('Vorlesung')).toBeInTheDocument()
  })

  it('should render the correct footer text', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={mockCourses} />)

    expect(screen.getByText('3 Vorlesungen ohne Erfahrung')).toBeInTheDocument()
  })

  it('should render empty table when no courses exist', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={[]} />)

    expect(screen.getByText('0 Vorlesungen ohne Erfahrung')).toBeInTheDocument()
  })

  it('should call downloadJSON when JSON export is triggered', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={mockCourses} />)

    fireEvent.click(screen.getByText('JSON'))

    expect(utils.downloadJSON).toHaveBeenCalledWith(
      { vorlesungenOhneProvadisErfahrung: mockCourses },
      'vorlesungen-ohne-provadis-erfahrung'
    )
  })

  it('should call downloadCSV when CSV export is triggered', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={mockCourses} />)

    fireEvent.click(screen.getByText('CSV'))

    expect(utils.downloadCSV).toHaveBeenCalledWith(
      ['Vorlesung'],
      [['Biologie'], ['Chemie'], ['Kunst']],
      'vorlesungen-ohne-provadis-erfahrung'
    )
  })

  it('should call generatePDF when PDF export is triggered', () => {
    render(<ReportCardCoursesWithoutProvadisExperience courses={mockCourses} />)

    fireEvent.click(screen.getByText('PDF'))

    expect(utils.generatePDF).toHaveBeenCalledWith(
      'Vorlesungen ohne Provadis-Erfahrung',
      'Alle Vorlesungen, für die kein Dozent mit Provadis-Erfahrung verfügbar ist'
    )
  })
})
