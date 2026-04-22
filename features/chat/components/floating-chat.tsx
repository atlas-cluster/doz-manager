'use client'

import {
  Check,
  Copy,
  Maximize2,
  MessageCircle,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  X,
} from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

import { ChatMarkdown } from '@/features/chat/components/chat-markdown'
import { ChatToolIndicator } from '@/features/chat/components/chat-tool-indicator'
import { ChatToolSummary } from '@/features/chat/components/chat-tool-summary'
import { Button } from '@/features/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import { ScrollArea } from '@/features/shared/components/ui/scroll-area'
import { Textarea } from '@/features/shared/components/ui/textarea'
import { cn } from '@/features/shared/lib/utils'

type ToolInfo = {
  name: string
  label: string
}

type ChatMessage = {
  role: 'assistant' | 'user'
  content: string
  toolsUsed?: ToolInfo[]
}

type SSEEvent = {
  event: string
  data: Record<string, unknown>
}

function parseSSEChunk(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = []
  const blocks = chunk.split('\n\n').filter(Boolean)

  for (const block of blocks) {
    let event = ''
    let data = ''

    for (const line of block.split('\n')) {
      if (line.startsWith('event: ')) {
        event = line.slice(7)
      } else if (line.startsWith('data: ')) {
        data = line.slice(6)
      }
    }

    if (event && data) {
      try {
        events.push({
          event,
          data: JSON.parse(data) as Record<string, unknown>,
        })
      } catch {
        /* skip malformed events */
      }
    }
  }

  return events
}

const STORAGE_KEY = 'dozbot-chat-messages'

const GREETING_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Hallo 👋 Ich bin DozBot, dein Assistent für Dozenten- und Vorlesungsverwaltung.',
}

function loadMessages(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as ChatMessage[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore corrupt storage */
  }
  return [GREETING_MESSAGE]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Kopiert!')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-6 opacity-0 transition-opacity group-hover/msg:opacity-100"
      onClick={handleCopy}
      aria-label="Nachricht kopieren">
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </Button>
  )
}

export function FloatingChat() {
  const [open, setOpen] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    GREETING_MESSAGE,
  ])
  const [prompt, setPrompt] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [activeTools, setActiveTools] = React.useState<ToolInfo[]>([])
  const endRef = React.useRef<HTMLDivElement | null>(null)
  const abortRef = React.useRef<AbortController | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  // Load persisted messages on mount
  React.useEffect(() => {
    setMessages(loadMessages())
  }, [])

  // Persist messages to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      /* storage full — ignore */
    }
  }, [messages])

  // Auto-scroll to bottom
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, activeTools, open])

  // Focus textarea when chat opens
  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [open])

  // Escape to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleClear = () => {
    abortRef.current?.abort()
    setMessages([GREETING_MESSAGE])
    setPrompt('')
    setIsLoading(false)
    setActiveTools([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form) form.requestSubmit()
    }
  }

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
    setActiveTools([])

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const collectedTools: ToolInfo[] = []

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(payload.error ?? 'Chat-Anfrage fehlgeschlagen.')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Kein Stream erhalten.')

      const decoder = new TextDecoder()
      let buffer = ''
      let finalContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lastDoubleNewline = buffer.lastIndexOf('\n\n')
        if (lastDoubleNewline === -1) continue

        const complete = buffer.slice(0, lastDoubleNewline + 2)
        buffer = buffer.slice(lastDoubleNewline + 2)

        for (const sseEvent of parseSSEChunk(complete)) {
          switch (sseEvent.event) {
            case 'tool_start': {
              const tool: ToolInfo = {
                name: sseEvent.data.name as string,
                label: sseEvent.data.label as string,
              }
              setActiveTools((prev) => [...prev, tool])
              break
            }
            case 'tool_end': {
              const endName = sseEvent.data.name as string
              collectedTools.push({
                name: endName,
                label: sseEvent.data.label as string,
              })
              setActiveTools((prev) => prev.filter((t) => t.name !== endName))
              break
            }
            case 'content': {
              finalContent = sseEvent.data.text as string
              break
            }
            case 'error': {
              throw new Error(sseEvent.data.message as string)
            }
            case 'done': {
              break
            }
          }
        }
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            finalContent || 'Keine Antwort erhalten. Bitte versuche es erneut.',
          toolsUsed: collectedTools.length > 0 ? collectedTools : undefined,
        },
      ])
    } catch (error) {
      if ((error as Error).name === 'AbortError') return

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
      setActiveTools([])
      abortRef.current = null
    }
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 max-sm:right-0 max-sm:bottom-0">
      {open ? (
        <Card
          aria-busy={isLoading}
          className={cn(
            'pointer-events-auto flex flex-col py-0 ring-1 ring-border shadow-xl transition-all duration-200',
            isMaximized
              ? 'h-[80vh] w-[680px] max-h-[calc(100vh-2rem)]'
              : 'h-[520px] w-[380px]',
            'max-w-[calc(100vw-2rem)]',
            'max-sm:fixed max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-none max-sm:ring-0'
          )}>
          <CardHeader className="bg-muted/30 flex min-h-12 flex-row items-center justify-between gap-2 border-b px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary size-4" />
              <CardTitle className="text-sm font-semibold">DozBot</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleClear}
                disabled={messages.length <= 1 && !isLoading}
                aria-label="Chat zurücksetzen">
                <RotateCcw className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="max-sm:hidden"
                onClick={() => setIsMaximized((v) => !v)}
                aria-label={
                  isMaximized ? 'Chat verkleinern' : 'Chat vergrößern'
                }>
                {isMaximized ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="Chat schließen">
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 px-0">
            <ScrollArea className="h-full px-4 py-3">
              <div className="space-y-3" role="log" aria-live="polite">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}-${message.content.slice(0, 20)}`}>
                    {message.role === 'assistant' &&
                      message.toolsUsed &&
                      message.toolsUsed.length > 0 && (
                        <ChatToolSummary tools={message.toolsUsed} />
                      )}
                    <div
                      className={cn(
                        'group/msg relative',
                        message.role === 'user'
                          ? 'ml-auto w-fit max-w-[85%]'
                          : 'mr-auto w-fit max-w-[85%]'
                      )}>
                      <div
                        className={
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm whitespace-pre-wrap'
                            : 'bg-muted rounded-lg border px-3 py-2 text-sm'
                        }>
                        {message.role === 'user' ? (
                          message.content
                        ) : (
                          <ChatMarkdown content={message.content} />
                        )}
                      </div>
                      {message.role === 'assistant' && index > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <CopyButton text={message.content} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && <ChatToolIndicator activeTools={activeTools} />}
                <div ref={endRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t px-3 py-2.5">
            <form
              className="flex w-full items-end gap-2"
              onSubmit={handleSubmit}>
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value)
                  resizeTextarea()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Nachricht eingeben …"
                disabled={isLoading}
                rows={1}
                className="max-h-[120px] min-h-9 py-2"
              />
              {isLoading ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  onClick={() => abortRef.current?.abort()}
                  aria-label="Generierung stoppen">
                  <Square className="size-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon-sm"
                  disabled={prompt.trim().length === 0}
                  aria-label="Nachricht senden">
                  <Send className="size-4" />
                </Button>
              )}
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
