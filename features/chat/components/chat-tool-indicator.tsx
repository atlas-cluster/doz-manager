import { Loader2, Wrench } from 'lucide-react'

import { Badge } from '@/features/shared/components/ui/badge'

type ToolInfo = {
  name: string
  label: string
}

export function ChatToolIndicator({
  activeTools,
}: {
  activeTools: ToolInfo[]
}) {
  if (activeTools.length === 0) {
    return (
      <div className="text-muted-foreground bg-muted mr-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Denke nach …
      </div>
    )
  }

  return (
    <div className="bg-muted mr-auto space-y-2 rounded-lg border px-3 py-2">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Arbeite …
      </div>
      <div className="flex flex-wrap gap-1">
        {activeTools.map((tool) => (
          <Badge
            key={tool.name}
            variant="outline"
            className="text-muted-foreground gap-1 text-xs font-normal">
            <Wrench className="size-3" />
            {tool.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}
