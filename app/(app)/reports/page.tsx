import { CircleAlertIcon } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/features/shared/components/ui/empty'

export default function ReportsPage() {
  return (
    <Empty className={'h-full'}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>No Content Available</EmptyTitle>
        <EmptyDescription>
          There is currently no content to display here. Please check back later
          or add new content to get started.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
