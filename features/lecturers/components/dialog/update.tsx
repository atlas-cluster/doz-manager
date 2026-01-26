'use client'

import { updateLecturer } from '../../actions/update'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer.schema'
import { BaseDialog } from '@/features/shared/components/dialog'
import { zodResolver } from '@hookform/resolvers/zod'

export function UpdateDialog({
  lecturerId,
  lecturerData,
  open,
  onOpenChange,
}: {
  lecturerId: string
  lecturerData: z.infer<typeof lecturerSchema>
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<z.infer<typeof lecturerSchema>>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: lecturerData,
  })

  const text = {
    dialogTitle: 'Dozent bearbeiten',
    dialogDescription: 'Hier können Sie den Dozent bearbeiten',
    submitButton: 'Speichern',
  }

  function onSubmit(data: z.infer<typeof lecturerSchema>) {
    updateLecturer(lecturerId, data).then(() => {
      onOpenChange(false)
      form.reset(data)
    })
  }

  return (
    <BaseDialog
      open={open}
      form={form}
      onSubmit={onSubmit}
      text={text}
      onOpenChange={onOpenChange}
    />
  )
}
