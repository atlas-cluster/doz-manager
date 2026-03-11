'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ThemeToggle } from '@/features/app'
import { authClient } from '@/features/auth/lib/client'
import { Button } from '@/features/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'

const LoginForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim() || ''
    const password = formData.get('password')?.toString() || ''

    if (!email || !password) {
      toast.error('Bitte geben Sie E-Mail und Passwort ein.')
      return
    }

    setIsSubmitting(true)

    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    setIsSubmitting(false)

    if (error) {
      toast.error(
        'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Zugangsdaten.'
      )
      return
    }

    toast.success('Erfolgreich angemeldet.')
    router.push('/lecturers')
    router.refresh()
  }

  return (
    <section className="bg-foreground dark:bg-background min-h-screen flex items-center justify-center relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src={'/bg.png'}
          alt={'bg'}
          fill
          priority
          sizes="(min-width: 768px) 100vw"
          quality={75}
          className="object-cover object-right"
        />
      </div>

      <div className="py-10 md:py-20 max-w-lg px-4 sm:px-0 mx-auto w-full">
        <Card className="max-w-lg px-6 py-8 sm:p-12 relative gap-6">
          <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
            <ThemeToggle />
          </div>
          <CardHeader className="text-center gap-6 p-0">
            <div className="mx-auto">
              <Image
                src={'/provadis-hochschule.svg'}
                alt={'Provadis Logo'}
                width={1024}
                height={392}
                className="h-20 w-auto dark:hidden"
              />
              <Image
                src={'/provadis-hochschule-dark.svg'}
                alt={'Provadis Logo'}
                width={1024}
                height={392}
                className="hidden h-20 w-auto dark:block"
              />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl font-medium text-card-foreground">
                Willkommen zum Dozentenverwaltungsportal
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-normal">
                Melden Sie sich mit Ihrem Konto an
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-6">
                <Button
                  variant="outline"
                  type="button"
                  className="text-sm text-medium text-card-foreground gap-2 dark:bg-background rounded-lg h-9 shadow-xs cursor-pointer"
                  onClick={() =>
                    toast.error('Microsoft Login ist derzeit nicht verfügbar')
                  }>
                  <Image
                    src={'/microsoft.svg'}
                    alt={'Microsoft Logo'}
                    width={64}
                    height={64}
                    className="h-4 w-4"
                  />
                  Anmelden mit Microsoft
                </Button>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-sm text-muted-foreground bg-transparent">
                  <span className="px-4">oder anmelden mit</span>
                </FieldSeparator>

                <div className="flex flex-col gap-4">
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="email"
                      className="text-sm text-muted-foreground font-normal">
                      <div>
                        E-Mail{' '}
                        <sup className={'text-destructive text-sm font-normal'}>
                          *
                        </sup>
                      </div>
                    </FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="mail@provadis-hochschule.de"
                      required
                      className="dark:bg-background h-9 shadow-xs"
                    />
                  </Field>
                  <Field className="gap-1.5">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm text-muted-foreground font-normal">
                      <div>
                        Passwort{' '}
                        <sup className={'text-destructive text-sm font-normal'}>
                          *
                        </sup>
                      </div>
                    </FieldLabel>

                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Geben Sie Ihr Passwort ein"
                      required
                      className="dark:bg-background h-9 shadow-xs"
                    />
                  </Field>
                </div>
                <Field className="gap-4">
                  <Button
                    type="submit"
                    size={'lg'}
                    disabled={isSubmitting}
                    className="rounded-lg h-10 hover:bg-primary/80 cursor-pointer">
                    {isSubmitting ? 'Anmeldung...' : 'Anmelden'}
                  </Button>
                  <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                    Sie haben noch kein Konto?{' '}
                    <a
                      href="mailto:admin@provaids-hochschule.de"
                      className="font-medium text-card-foreground no-underline!">
                      Kontaktieren Sie einen Administrator
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default LoginForm
