import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppHeader } from '@/features/app/components/app-header'
import { SidebarProvider } from '@/features/shared/components/ui/sidebar'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const refreshMock = vi.fn()
const reloadMock = vi.fn()
let mockPathname = '/lecturers'
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    refresh: refreshMock,
  }),
}))

function renderWithProviders() {
  return render(
    <SidebarProvider>
      <AppHeader />
    </SidebarProvider>
  )
}

class MockEventSource {
  private listeners = new Map<string, Set<EventListener>>()
  close = vi.fn()

  addEventListener = (type: string, listener: EventListener) => {
    const handlers = this.listeners.get(type) ?? new Set<EventListener>()
    handlers.add(listener)
    this.listeners.set(type, handlers)
  }

  removeEventListener = (type: string, listener: EventListener) => {
    const handlers = this.listeners.get(type)
    handlers?.delete(listener)
  }

  dispatch(type: string) {
    const handlers = this.listeners.get(type)
    if (!handlers) return
    for (const handler of handlers) {
      handler(new Event(type))
    }
  }
}

let eventSourceInstance: MockEventSource | null = null

class TrackedMockEventSource extends MockEventSource {
  constructor() {
    super()
    eventSourceInstance = this
  }
}

describe('AppHeader', () => {
  beforeEach(() => {
    mockPathname = '/lecturers'
    refreshMock.mockReset()
    reloadMock.mockReset()
    vi.stubGlobal('location', {
      ...window.location,
      reload: reloadMock,
    })
    vi.stubGlobal(
      'EventSource',
      TrackedMockEventSource as unknown as EventSource
    )
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    eventSourceInstance = null
  })

  it('should render the formatted route name', () => {
    renderWithProviders()

    expect(screen.getByText('Dozenten')).toBeInTheDocument()
  })

  it('should render the theme toggle', () => {
    renderWithProviders()

    expect(
      screen.getByRole('button', { name: 'Toggle theme' })
    ).toBeInTheDocument()
  })

  it('should show refresh button after update event and refresh on click', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    eventSourceInstance?.dispatch('update')

    const refreshButton = await screen.findByRole('button', {
      name: 'Aktualisieren',
    })

    await user.click(refreshButton)

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Aktualisieren' })
      ).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(reloadMock).toHaveBeenCalledTimes(1)
    })
  })

  it('should show loading label while refresh is in progress', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    eventSourceInstance?.dispatch('update')

    const refreshButton = await screen.findByRole('button', {
      name: 'Aktualisieren',
    })

    await user.click(refreshButton)

    expect(screen.getByRole('button', { name: 'Aktualisieren' })).toHaveClass(
      'scale-95'
    )
  })

  it('should render refresh button on the left title section', async () => {
    renderWithProviders()

    eventSourceInstance?.dispatch('update')

    await screen.findByRole('button', {
      name: 'Aktualisieren',
    })

    const heading = screen.getByRole('heading', { name: 'Dozenten' })
    const leftSection = heading.parentElement
    expect(leftSection).not.toBeNull()

    expect(
      within(leftSection as HTMLElement).getByRole('button', {
        name: 'Aktualisieren',
      })
    ).toBeInTheDocument()
  })

  it('should connect to users scope on settings page', () => {
    mockPathname = '/settings'
    const eventSourceSpy = vi.fn(function () {
      return new TrackedMockEventSource()
    })
    vi.stubGlobal('EventSource', eventSourceSpy as unknown as EventSource)

    renderWithProviders()

    expect(eventSourceSpy).toHaveBeenCalledTimes(1)
    expect(eventSourceSpy).toHaveBeenCalledWith(
      '/api/updates/stream?scope=users'
    )
  })

  it('should connect to lecturers and courses scopes on reports page', () => {
    mockPathname = '/reports'
    const eventSourceSpy = vi.fn(function () {
      return new TrackedMockEventSource()
    })
    vi.stubGlobal('EventSource', eventSourceSpy as unknown as EventSource)

    renderWithProviders()

    expect(eventSourceSpy).toHaveBeenCalledTimes(2)
    expect(eventSourceSpy).toHaveBeenNthCalledWith(
      1,
      '/api/updates/stream?scope=lecturers'
    )
    expect(eventSourceSpy).toHaveBeenNthCalledWith(
      2,
      '/api/updates/stream?scope=courses'
    )
  })
})
