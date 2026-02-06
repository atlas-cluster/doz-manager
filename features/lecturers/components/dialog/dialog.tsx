import { ReactNode, useState } from 'react'

import { LecturerForm } from '@/features/lecturers/components/dialog/form'
import { Dialog, DialogTrigger } from '@/features/shared/components/ui/dialog'
import { DialogContent } from '@/features/shared/components/ui/dialog'

interface LecturerDialogProps {
  lecturerId?: string
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: () => void
}

export function LecturerDialog({
  lecturerId,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSubmit,
}: LecturerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={'sm:max-h-[90vh] min-w-[30vw]'}
        showCloseButton={false}>
        <LecturerForm
          lecturerId={lecturerId}
          setOpen={setOpen}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
