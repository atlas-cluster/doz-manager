import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReportCardCoursesWithoutLecturers } from '@/features/reports/components/card/courses-without-lecturers'
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

const mockCourses = ['Philosophie', 'Geschichte']

describe('ReportCardCoursesWithoutLecturers', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the card title and description', () => {
    render(<ReportCardCoursesWithoutLecturers courses={mockCourses} />)

    expect(screen.getByText('Vorlesungen ohne Dozenten')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Alle Vorlesungen, denen noch kein Dozent zugewiesen ist'
      )
    ).toBeInTheDocument()
  })

  it('should render the course count badge', () => {
    render(<ReportCardCoursesWithoutLecturers courses={mockCourses} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should render all courses in the table', () => {
    render(<ReportCardCoursesWithoutLecturers courses={mockCourses} />)

    expect(screen.getByText('Philosophie')).toBeInTheDocument()
    expect(screen.getByText('Geschichte')).toBeInTheDocument()
  })

  it('should render the table header', () => {
    render(<ReportCardCoursesWithoutLecturers courses={mockCourses} />)

    expect(screen.getByText('Vorlesung')).toBeInTheDocument()
  })

  it('should render the correct footer text', () => {
    render(<ReportCardCoursesWithoutLecturers courses={mockCourses} />)

    expect(screen.getByText('2 Vorlesungen ohne Zuordnung')).toBeInTheDocument()
  })

  it('should render empty table when no courses exist', () => {
    render(<ReportCardCoursesWithoutLecturers courses={[]} />)

    expect(screen.getByText('0 Vorlesungen ohne Zuordnung')).toBeInTheDocument()
  })

  it('should call downloadJSON when JSON export is triggered', () => {
    render(<ReportCardCoursesWithoutLecturers courses={mockCourses} />)

    fireEvent.click(screen.getByText('JSON'))

    expect(utils.downloadJSON).toHaveBeenCalledWith(
      { vorlesungenOhneDozenten: mockCourses },
      'vorlesungen-ohne-dozenten'
    )
  })

  it('should call downloadCSV when CSV export is triggered', () => {
    render(<ReportCardCoursesWithoutLecturers courses={mockCourses} />)

    fireEvent.click(screen.getByText('CSV'))

    expect(utils.downloadCSV).toHaveBeenCalledWith(
      ['Vorlesung'],
      [['Philosophie'], ['Geschichte']],
      'vorlesungen-ohne-dozenten'
    )
  })

  it('should call generatePDF when PDF export is triggered', () => {
    render(<ReportCardCoursesWithoutLecturers courses={mockCourses} />)

    fireEvent.click(screen.getByText('PDF'))

    expect(utils.generatePDF).toHaveBeenCalledWith(
      'Vorlesungen ohne Dozenten',
      'Alle Vorlesungen, denen noch kein Dozent zugewiesen ist'
    )
  })
})
