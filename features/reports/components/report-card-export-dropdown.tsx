'use client'

import { BracesIcon, DownloadIcon, FileTextIcon, SheetIcon } from 'lucide-react'

import { Button } from '@/features/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/features/shared/components/ui/dropdown-menu'

interface ReportCardExportDropdownProps {
  onExportPDF?: () => void
  onExportJSON?: () => void
  onExportCSV?: () => void
}

export function ReportCardExportDropdown({
  onExportPDF,
  onExportJSON,
  onExportCSV,
}: ReportCardExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <DownloadIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export als...</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => onExportPDF?.()}>
            <FileTextIcon color="red" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExportJSON?.()}>
            <BracesIcon color="#feb204" />
            JSON
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExportCSV?.()}>
            <SheetIcon color="green" />
            CSV
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
