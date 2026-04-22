'use client'

import { Check, Copy } from 'lucide-react'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Button } from '@/features/shared/components/ui/button'
import { cn } from '@/features/shared/lib/utils'

function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-6"
      onClick={handleCopy}
      aria-label="Code kopieren">
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </Button>
  )
}

export function ChatMarkdown({
  content,
  inverted = false,
}: {
  content: string
  inverted?: boolean
}) {
  return (
    <div
      className={cn(
        'max-w-none text-sm break-words',
        '[&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold',
        '[&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold',
        '[&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold',
        '[&_p]:my-0 [&_p+p]:mt-2',
        '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_li]:my-1',
        '[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic',
        '[&_hr]:my-3 [&_hr]:border-border',
        '[&_a]:underline [&_a]:underline-offset-2',
        inverted
          ? '[&_a]:text-primary-foreground/90 [&_pre]:bg-primary-foreground/10 [&_pre]:text-primary-foreground [&_code]:bg-primary-foreground/10 [&_code]:text-primary-foreground [&_blockquote]:border-primary-foreground/30'
          : '[&_a]:text-primary [&_pre]:bg-background [&_pre]:text-foreground [&_code]:bg-background [&_code]:text-foreground [&_blockquote]:border-border'
      )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ className, ...props }) => (
            <a
              className={cn('font-medium', className)}
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          table: ({ className, ...props }) => (
            <div className="my-2 overflow-x-auto rounded-md border">
              <table
                className={cn('w-full border-collapse text-xs', className)}
                {...props}
              />
            </div>
          ),
          thead: ({ className, ...props }) => (
            <thead className={cn('bg-muted/60', className)} {...props} />
          ),
          th: ({ className, ...props }) => (
            <th
              className={cn(
                'border-b px-2 py-1.5 text-left font-medium whitespace-nowrap',
                className
              )}
              {...props}
            />
          ),
          td: ({ className, ...props }) => (
            <td className={cn('border-b px-2 py-1.5', className)} {...props} />
          ),
          tr: ({ className, ...props }) => (
            <tr
              className={cn('even:bg-muted/30 transition-colors', className)}
              {...props}
            />
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className)
            const lang = className?.replace('language-', '') ?? ''

            if (isBlock) {
              const codeText = String(children).replace(/\n$/, '')
              return (
                <div className="group/code relative">
                  <div className="bg-muted/60 flex items-center justify-between rounded-t-md border border-b-0 px-3 py-1">
                    <span className="text-muted-foreground text-[0.6875rem]">
                      {lang || 'code'}
                    </span>
                    <CodeCopyButton code={codeText} />
                  </div>
                  <pre
                    className={cn(
                      'overflow-x-auto rounded-b-md border px-3 py-2 font-mono text-[0.8125rem]',
                      inverted
                        ? 'bg-primary-foreground/10 text-primary-foreground'
                        : 'bg-background text-foreground'
                    )}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              )
            }

            return (
              <code
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[0.8125rem]',
                  className
                )}
                {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => <div className="my-2">{children}</div>,
        }}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
