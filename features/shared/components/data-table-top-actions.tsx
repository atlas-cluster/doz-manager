'use client'

import { ReactNode } from 'react'

interface TableButtonsProps {
  left?: ReactNode
  right?: ReactNode
}

export function DataTableTopActions({
  left,
  right,
}: TableButtonsProps): ReactNode {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className={'flex items-center justify-start gap-3'}>{left}</div>
      <div className={'flex items-center justify-end gap-3'}>{right}</div>
    </div>
  )
}
