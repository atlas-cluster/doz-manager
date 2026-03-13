import { afterEach, describe, expect, it, vi } from 'vitest'

import { EditFieldDialog } from '@/features/auth/components/dialogs/edit-field-dialog'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

describe('EditFieldDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Name ändern',
    description: 'Geben Sie Ihren neuen Namen ein.',
    placeholder: 'Ihr Name',
    value: '',
    onChange: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
  }

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should render the title', () => {
    render(<EditFieldDialog {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(<EditFieldDialog {...defaultProps} />)
    expect(screen.getByText(/neuen Namen/)).toBeInTheDocument()
  })

  it('should render the input with placeholder', () => {
    render(<EditFieldDialog {...defaultProps} />)
    expect(screen.getByPlaceholderText('Ihr Name')).toBeInTheDocument()
  })

  it('should render the input value', () => {
    render(<EditFieldDialog {...defaultProps} value="Max" />)
    expect(screen.getByDisplayValue('Max')).toBeInTheDocument()
  })

  it('should call onChange when typing', () => {
    render(<EditFieldDialog {...defaultProps} />)
    const input = screen.getByPlaceholderText('Ihr Name')
    fireEvent.change(input, { target: { value: 'Neuer Name' } })
    expect(defaultProps.onChange).toHaveBeenCalledWith('Neuer Name')
  })

  it('should call onSave when clicking Speichern', () => {
    render(<EditFieldDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(defaultProps.onSave).toHaveBeenCalled()
  })

  it('should call onSave when pressing Enter in input', () => {
    render(<EditFieldDialog {...defaultProps} />)
    const input = screen.getByPlaceholderText('Ihr Name')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(defaultProps.onSave).toHaveBeenCalled()
  })

  it('should call onOpenChange(false) when clicking Abbrechen', () => {
    render(<EditFieldDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should disable buttons when isSaving is true', () => {
    render(<EditFieldDialog {...defaultProps} isSaving={true} />)
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeDisabled()
  })

  it('should use the specified inputType', () => {
    render(<EditFieldDialog {...defaultProps} inputType="email" />)
    const input = screen.getByPlaceholderText('Ihr Name')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should not render when open is false', () => {
    render(<EditFieldDialog {...defaultProps} open={false} />)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})
