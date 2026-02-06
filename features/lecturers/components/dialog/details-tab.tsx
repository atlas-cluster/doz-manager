import { Controller, useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { PhoneInput } from '@/features/shared/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select'
import { Skeleton } from '@/features/shared/components/ui/skeleton'

export function DetailsTab(props: { isLoading: boolean }) {
  const { control } = useFormContext<z.infer<typeof lecturerSchema>>()

  if (props.isLoading) {
    return (
      <div className={'space-y-8'}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className={'space-y-2'}>
            <Skeleton className={'h-4 w-10'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
          <div className={'space-y-2'}>
            <Skeleton className={'h-4 w-16'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={'space-y-2'}>
            <Skeleton className={'h-4 w-28'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
          <div className={'space-y-2'}>
            <Skeleton className={'h-4 w-20'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={'space-y-2'}>
            <Skeleton className={'h-4 w-12'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
          <div className={'space-y-2'}>
            <Skeleton className={'h-4 w-28'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={'space-y-2'}>
            <Skeleton className={'h-4 w-24'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
          <div className={'space-y-2'}>
            <Skeleton className={'h-4 w-36'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={'space-y-3'}>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            name={'title'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="title">Titel</FieldLabel>
                <Input
                  id="title"
                  placeholder="Prof."
                  {...field}
                  value={field.value ?? ''}
                  aria-invalid={fieldState.invalid}
                  autoComplete={'off'}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name={'firstName'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="firstName">
                  <span>
                    Vorname<sup className={'text-destructive'}>*</sup>
                  </span>
                </FieldLabel>
                <Input
                  id="firstName"
                  placeholder="Vorname"
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete={'off'}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name={'secondName'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="secondName">
                  <span>Zweiter Vorname</span>
                </FieldLabel>
                <Input
                  id="secondName"
                  placeholder="Zweiter Vorname"
                  {...field}
                  value={field.value ?? ''}
                  aria-invalid={fieldState.invalid}
                  autoComplete={'off'}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name={'lastName'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lastName">
                  <span>
                    Nachname<sup className={'text-destructive'}>*</sup>
                  </span>
                </FieldLabel>
                <Input
                  id="lastName"
                  placeholder="Nachname"
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete={'off'}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name={'email'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">
                  <span>
                    E-Mail<sup className={'text-destructive'}>*</sup>
                  </span>
                </FieldLabel>
                <Input
                  id="email"
                  placeholder="beispiel@mail.de"
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete={'off'}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name={'phone'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phone">
                  <span>
                    Telefonnummer
                    <sup className={'text-destructive'}>*</sup>
                  </span>
                </FieldLabel>
                <PhoneInput
                  id={'phone'}
                  {...field}
                  onChange={field.onChange}
                  defaultCountry={'DE'}
                  international
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name={'type'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="type">
                  <span>
                    Dozententyp
                    <sup className={'text-destructive'}>*</sup>
                  </span>
                </FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie einen Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Intern</SelectItem>
                    <SelectItem value="external">Extern</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name={'courseLevelPreference'}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="courseLevelPreference">
                  <span>
                    Vorlesungspräferenz
                    <sup className={'text-destructive'}>*</sup>
                  </span>
                </FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie die Vorlesungspräferenz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="both">Beides</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>
    </div>
  )
}
