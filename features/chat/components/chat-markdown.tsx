import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/features/shared/lib/utils'

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
        '[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs',
        '[&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium',
        '[&_td]:border [&_td]:px-2 [&_td]:py-1',
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
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className)

            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
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
          pre: ({ className, ...props }) => (
            <pre
              className={cn(
                'my-2 overflow-x-auto rounded-md border px-3 py-2 font-mono text-[0.8125rem]',
                className
              )}
              {...props}
            />
          ),
        }}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
