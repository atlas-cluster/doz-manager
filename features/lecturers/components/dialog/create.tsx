'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createLecturer } from '@/features/lecturers/actions/create'
import { lecturerSchema } from '@/features/lecturers/schemas/lecturer.schema'
import { BaseDialog } from '@/features/shared/components/dialog'
import { zodResolver } from '@hookform/resolvers/zod'

export function CreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<z.infer<typeof lecturerSchema>>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: {
      title: '',
      firstName: '',
      secondName: '',
      lastName: '',
      email: '',
      phone: '',
      type: 'internal',
      courseLevelPreference: 'both',
    },
  })

  const text = {
    dialogTitle: 'Dozent erstellen',
    dialogDescription: 'Hier können Sie einen neuen Dozenten erstellen',
    submitButton: 'Erstellen',
  }

  function onSubmit(data: z.infer<typeof lecturerSchema>) {
    createLecturer(data).then(() => {
      onOpenChange(false)
      form.reset()
    })
  }

  return (
    <BaseDialog
      open={open}
      text={text}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={onSubmit}
    />
  )
}
