import { ReactNode, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z, { set } from 'zod'

import { CourseQualification } from '@/features/courses'
import { qualificationSchema } from '@/features/lecturers/schemas/lecturer'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/shared/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldTitle,
} from '@/features/shared/components/ui/field'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/features/shared/components/ui/radio-group'
import { zodResolver } from '@hookform/resolvers/zod'

interface EditQualificationDialogProps {
  trigger: ReactNode
  onSubmit: (
    data: z.infer<typeof qualificationSchema>,
    courseId: string
  ) => void
  courseQualification?: CourseQualification
  courseId: string
}

export function EditQualificationDialog({
  trigger,
  onSubmit,
  courseQualification,
  courseId,
}: EditQualificationDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof qualificationSchema>>({
    resolver: zodResolver(qualificationSchema),
    defaultValues: {
      experience: 'none',
      leadTime: 'short',
    },
  })

  useEffect(() => {
    if (open) {
      if (courseQualification) {
        form.reset({
          experience: courseQualification.experience,
          leadTime: courseQualification.leadTime,
        })
      }
      form.reset()
    }
  }, [courseQualification, form, open])

  const handleSubmit = async (data: z.infer<typeof qualificationSchema>) => {
    await onSubmit(data, courseId)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Details bearbeiten</DialogTitle>
          <DialogDescription>
            Wählen Sie die Erfahrung und die Vorlaufzeit für diese Vorlesung
            aus.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Controller
            name="experience"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Erfahrung</FieldLabel>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2">
                  <FieldLabel htmlFor="experience-none">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Keine</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem value="none" id="experience-none" />
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="experience-other-uni">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Extern</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem
                        value="other_uni"
                        id="experience-other-uni"
                      />
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="experience-provadis">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Provadis</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem
                        value="provadis"
                        id="experience-provadis"
                      />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="leadTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Vorlaufzeit</FieldLabel>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2">
                  <FieldLabel htmlFor="leadtime-short">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Sofort</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem value="short" id="leadtime-short" />
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="leadtime-four-weeks">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>4 Wochen</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem
                        value="four_weeks"
                        id="leadtime-four-weeks"
                      />
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="leadtime-more-weeks">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Mehrere Wochen</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem
                        value="more_weeks"
                        id="leadtime-more-weeks"
                      />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DialogClose>
            <Button type="submit">Speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
