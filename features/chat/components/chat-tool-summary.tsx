import { Wrench } from 'lucide-react'

import { Badge } from '@/features/shared/components/ui/badge'

type ToolInfo = {
  name: string
  label: string
}

export function ChatToolSummary({ tools }: { tools: ToolInfo[] }) {
  if (tools.length === 0) return null

  return (
    <details className="text-muted-foreground mr-auto text-xs">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 select-none">
        <Wrench className="size-3" />
        <span>
          {tools.length} {tools.length === 1 ? 'Tool' : 'Tools'} verwendet
        </span>
      </summary>
      <div className="mt-1 flex flex-wrap gap-1 pb-1">
        {tools.map((tool, index) => (
          <Badge
            key={`${tool.name}-${index}`}
            variant="secondary"
            className="text-xs font-normal">
            {tool.label}
          </Badge>
        ))}
      </div>
    </details>
  )
}
