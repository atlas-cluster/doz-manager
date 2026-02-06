import { useEffect, useState } from 'react'
import { FieldErrors, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import { createLecturer } from '@/features/lecturers/actions/create-lecturer'
import { getLecturer } from '@/features/lecturers/actions/get-lecturer'
import { updateLecturer } from '@/features/lecturers/actions/update-lecturer'
import { CoursesTab } from '@/features/lecturers/components/dialog/courses-tab'
import { DetailsTab } from '@/features/lecturers/components/dialog/details-tab'
import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import { Button } from '@/features/shared/components/ui/button'
import {
  DialogFooter,
  DialogHeader,
} from '@/features/shared/components/ui/dialog'
import {
  DialogDescription,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'

export function LecturerForm({
  lecturerId,
  setOpen,
  onSubmit,
}: {
  lecturerId?: string
  setOpen: (open: boolean) => void
  onSubmit?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const isEditDialog = !!lecturerId

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
      courseIds: [],
    },
  })

  const { reset } = form

  useEffect(() => {
    if (isEditDialog && lecturerId) {
      const loadData = async () => {
        setIsLoading(true)
        getLecturer(lecturerId)
          .then(({ lecturer, courses }) => {
            reset({
              title: lecturer.title ?? '',
              firstName: lecturer.firstName,
              secondName: lecturer.secondName ?? '',
              lastName: lecturer.lastName,
              email: lecturer.email,
              phone: lecturer.phone,
              type: lecturer.type,
              courseLevelPreference: lecturer.courseLevelPreference,
              courseIds: courses.map((c) => c.id),
            })
          })
          .finally(() => setIsLoading(false))
      }
      loadData()
    }
  }, [isEditDialog, lecturerId, reset])

  const onInvalid = (errors: FieldErrors<z.infer<typeof lecturerSchema>>) => {
    const detailsFields = [
      'title',
      'firstName',
      'secondName',
      'lastName',
      'email',
      'phone',
      'type',
      'courseLevelPreference',
    ]
    const hasDetailsError = detailsFields.some((field) => field in errors)

    if (hasDetailsError) {
      setActiveTab('details')
    } else if ('courseIds' in errors) {
      setActiveTab('courses')
    }
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isEditDialog && lecturerId) {
      const promise = updateLecturer(lecturerId, data)
      toast.promise(promise, {
        loading: 'Dozent wird aktualisiert...',
        success: 'Erfolgreich Dozenten aktualisiert',
        error: 'Fehler beim Aktualisieren des Dozenten',
      })
    } else {
      const promise = createLecturer(data)
      toast.promise(promise, {
        loading: 'Dozent wird erstellt...',
        success: 'Erfolgreich Dozenten erstellt',
        error: 'Fehler beim Erstellen des Dozenten',
      })
    }
    if (onSubmit) {
      onSubmit()
    }
    setOpen(false)
  }, onInvalid)

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditDialog ? 'Dozent bearbeiten' : 'Dozent erstellen'}
        </DialogTitle>
        <DialogDescription>
          {isEditDialog
            ? 'Hier können Sie den Dozent bearbeiten'
            : 'Hier können Sie einen neuen Dozenten erstellen'}
        </DialogDescription>
      </DialogHeader>
      <FormProvider {...form}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="courses">Vorlesungen</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <DetailsTab isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="courses">
            <CoursesTab isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </FormProvider>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Abbrechen
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || form.formState.isSubmitting}>
          {isEditDialog ? 'Änderungen speichern' : 'Dozent erstellen'}
        </Button>
      </DialogFooter>
    </>
  )
}
