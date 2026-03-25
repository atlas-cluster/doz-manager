import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatMarkdown } from '@/features/chat/components/chat-markdown'

describe('ChatMarkdown', () => {
  it('renders markdown structures in chat output', () => {
    render(
      <ChatMarkdown
        content={[
          '# Titel',
          '',
          '- Punkt 1',
          '- Punkt 2',
          '',
          '`inline code`',
          '',
          '```ts',
          'const answer = 42',
          '```',
        ].join('\n')}
      />
    )

    expect(screen.getByRole('heading', { name: 'Titel' })).toBeInTheDocument()
    expect(screen.getByText('Punkt 1')).toBeInTheDocument()
    expect(screen.getByText('inline code')).toBeInTheDocument()
    expect(screen.getByText('const answer = 42')).toBeInTheDocument()
  })
})
