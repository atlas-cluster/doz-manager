'use client'

import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import React from 'react'

import { ChatMarkdown } from '@/features/chat/components/chat-markdown'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { Input } from '@/features/shared/components/ui/input'
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
}

export function FloatingChat() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hallo 👋 Ich bin DozBot. Frag mich zu Vorlesungen, Dozenten oder sichtbaren Features im System.',
    },
  ])
  const [prompt, setPrompt] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const endRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextPrompt = prompt.trim()
    if (!nextPrompt || isLoading) return

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: nextPrompt },
    ]

    setMessages(nextMessages)
    setPrompt('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      })

      const payload = (await response.json()) as {
        message?: string
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Chat-Anfrage fehlgeschlagen.')
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            payload.message ??
            'Keine Antwort erhalten. Bitte versuche es erneut oder frage etwas anderes.',
        },
      ])
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unerwarteter Fehler im Chat.'

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `⚠️ ${message}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {open ? (
        <Card className="pointer-events-auto h-[520px] w-[380px] max-w-[calc(100vw-2rem)] py-0 shadow-lg">
          <CardHeader className="flex min-h-14 flex-row items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />
              <CardTitle className="text-sm">DozBot</CardTitle>
              <Badge variant="secondary">Ollama</Badge>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="Chat schließen">
              <X />
            </Button>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 px-0">
            <ScrollArea className="h-full px-4 py-3">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                    className={
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto w-fit max-w-[85%] rounded-lg px-3 py-2 text-sm'
                        : 'bg-muted mr-auto w-fit max-w-[85%] rounded-lg border px-3 py-2 text-sm'
                    }>
                    {message.role === 'user' ? (
                      message.content
                    ) : (
                      <ChatMarkdown content={message.content} />
                    )}
                  </div>
                ))}
                {isLoading ? (
                  <div className="text-muted-foreground bg-muted mr-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    Denke nach ...
                  </div>
                ) : null}
                <div ref={endRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t px-3 py-3">
            <form
              className="flex w-full items-center gap-2"
              onSubmit={handleSubmit}>
              <Input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Frag DozBot nach Daten oder Features ..."
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon-sm"
                disabled={isLoading || prompt.trim().length === 0}
                aria-label="Nachricht senden">
                <Send className="size-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button
          type="button"
          size="icon-lg"
          className="pointer-events-auto rounded-full shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Chat öffnen">
          <MessageCircle className="size-5" />
        </Button>
      )}
    </div>
  )
}
