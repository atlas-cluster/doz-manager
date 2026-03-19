import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReportCardCoursesAtProvadis } from '@/features/reports/components/card/courses-at-provadis'
import { GetCoursesAtProvadisResponse } from '@/features/reports/types'
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

// Mock the export dropdown to make handlers directly callable in jsdom
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

const mockQualifications: GetCoursesAtProvadisResponse = {
  'Dr. Max Mustermann': ['Mathematik', 'Informatik'],
  'Anna Schmidt': ['Physik'],
}

describe('ReportCardCoursesAtProvadis', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the card title and description', () => {
    render(<ReportCardCoursesAtProvadis qualifications={mockQualifications} />)

    expect(screen.getByText('Vorlesungen an der Provadis')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Alle Dozenten mit ihren an der Provadis gehaltenen Vorlesungen'
      )
    ).toBeInTheDocument()
  })

  it('should render all lecturer names in the table', () => {
    render(<ReportCardCoursesAtProvadis qualifications={mockQualifications} />)

    expect(screen.getByText('Dr. Max Mustermann')).toBeInTheDocument()
    expect(screen.getByText('Anna Schmidt')).toBeInTheDocument()
  })

  it('should render all course badges', () => {
    render(<ReportCardCoursesAtProvadis qualifications={mockQualifications} />)

    expect(screen.getByText('Mathematik')).toBeInTheDocument()
    expect(screen.getByText('Informatik')).toBeInTheDocument()
    expect(screen.getByText('Physik')).toBeInTheDocument()
  })

  it('should render the correct footer counts', () => {
    render(<ReportCardCoursesAtProvadis qualifications={mockQualifications} />)

    // 2 lecturers, 3 courses total
    expect(screen.getByText(/2 Dozenten/)).toBeInTheDocument()
    expect(screen.getByText(/3 Vorlesungen/)).toBeInTheDocument()
  })

  it('should render table headers', () => {
    render(<ReportCardCoursesAtProvadis qualifications={mockQualifications} />)

    expect(screen.getByText('Dozent')).toBeInTheDocument()
    expect(screen.getByText('Vorlesungen')).toBeInTheDocument()
  })

  it('should render empty table when no qualifications exist', () => {
    render(<ReportCardCoursesAtProvadis qualifications={{}} />)

    expect(screen.getByText(/0 Dozenten/)).toBeInTheDocument()
    expect(screen.getByText(/0 Vorlesungen/)).toBeInTheDocument()
  })

  it('should call downloadJSON when JSON export is triggered', () => {
    render(<ReportCardCoursesAtProvadis qualifications={mockQualifications} />)

    fireEvent.click(screen.getByText('JSON'))

    expect(utils.downloadJSON).toHaveBeenCalledWith(
      mockQualifications,
      'vorlesungen-an-der-provadis'
    )
  })

  it('should call downloadCSV when CSV export is triggered', () => {
    render(<ReportCardCoursesAtProvadis qualifications={mockQualifications} />)

    fireEvent.click(screen.getByText('CSV'))

    expect(utils.downloadCSV).toHaveBeenCalledWith(
      ['Dozent', 'Vorlesungen'],
      expect.arrayContaining([
        ['Dr. Max Mustermann', 'Mathematik, Informatik'],
        ['Anna Schmidt', 'Physik'],
      ]),
      'vorlesungen-an-der-provadis'
    )
  })

  it('should call generatePDF when PDF export is triggered', () => {
    render(<ReportCardCoursesAtProvadis qualifications={mockQualifications} />)

    fireEvent.click(screen.getByText('PDF'))

    expect(utils.generatePDF).toHaveBeenCalledWith(
      'Vorlesungen an der Provadis',
      'Alle Dozenten mit ihren an der Provadis gehaltenen Vorlesungen'
    )
  })
})
