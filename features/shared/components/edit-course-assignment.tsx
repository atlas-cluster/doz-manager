import { ReactNode, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { courseAssignmentSchema } from '@/features/lecturers/schemas/qualification'
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

const formSchema = z.object({
  experience: z.enum(['none', 'other_uni', 'provadis']),
  leadTime: z.enum(['short', 'four_weeks', 'more_weeks']),
  courseLevelPreference: z.enum(['none', 'bachelor', 'master']).optional(),
})

type FormValues = z.infer<typeof formSchema>

export interface CourseAssignmentDetails {
  experience: 'none' | 'other_uni' | 'provadis' | null
  leadTime: 'short' | 'four_weeks' | 'more_weeks' | null
  courseLevelPreference: 'bachelor' | 'master' | null
}

interface EditCourseAssignmentDialogProps {
  trigger: ReactNode
  /** Existing values (if any) for this assignment row. */
  initial?: Partial<CourseAssignmentDetails>
  /** When true, render the per-row courseLevelPreference selector. */
  showCourseLevelPreference?: boolean
  onSubmit: (data: CourseAssignmentDetails) => void
}

/**
 * Small inline dialog used inside the merged assignment+qualification dialog
 * to edit qualification fields (experience, leadTime) and, when the lecturer
 * has `courseLevelPreference === 'both'`, an optional per-assignment
 * courseLevelPreference override.
 */
export function EditCourseAssignmentDialog({
  trigger,
  initial,
  showCourseLevelPreference = false,
  onSubmit,
}: EditCourseAssignmentDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experience: initial?.experience ?? 'none',
      leadTime: initial?.leadTime ?? 'short',
      courseLevelPreference: initial?.courseLevelPreference ?? 'none',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        experience: initial?.experience ?? 'none',
        leadTime: initial?.leadTime ?? 'short',
        courseLevelPreference: initial?.courseLevelPreference ?? 'none',
      })
    }
  }, [form, initial, open])

  const handleSubmit = (data: FormValues) => {
    onSubmit({
      experience: data.experience,
      leadTime: data.leadTime,
      courseLevelPreference:
        showCourseLevelPreference &&
        data.courseLevelPreference &&
        data.courseLevelPreference !== 'none'
          ? data.courseLevelPreference
          : null,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Details bearbeiten</DialogTitle>
          <DialogDescription>
            Wählen Sie Erfahrung und Vorlaufzeit
            {showCourseLevelPreference
              ? ' sowie ggf. die Vorlesungspräferenz für diese Zuordnung.'
              : '.'}
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
          {showCourseLevelPreference && (
            <Controller
              name="courseLevelPreference"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Vorlesungspräferenz</FieldLabel>
                  <RadioGroup
                    value={field.value ?? 'none'}
                    onValueChange={field.onChange}
                    className="flex flex-col gap-2">
                    <FieldLabel htmlFor="clp-none">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Keine Präferenz</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="none" id="clp-none" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="clp-bachelor">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Bachelor</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="bachelor" id="clp-bachelor" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="clp-master">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Master</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="master" id="clp-master" />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </Field>
              )}
            />
          )}
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

export { courseAssignmentSchema }
