'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useRef, useState } from 'react'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/features/shared/components/ui/input-otp'

type Step = 'credentials' | 'totp' | 'backup'

const SLIDE: Record<Step, string> = {
  credentials: 'translateX(0)',
  totp: 'translateX(-33.333%)',
  backup: 'translateX(-66.666%)',
}

const LoginForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<Step>('credentials')
  const [totpCode, setTotpCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const backupInputRef = useRef<HTMLInputElement>(null)

  const goToStep = (next: Step) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setStep(next)
    if (next === 'backup') {
      setTimeout(() => backupInputRef.current?.focus(), 350)
    }
  }

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim() || ''
    const password = formData.get('password')?.toString() || ''

    if (!email || !password) {
      toast.error('Bitte geben Sie E-Mail und Passwort ein.')
      return
    }

    setIsSubmitting(true)
    const { data, error } = await authClient.signIn.email({ email, password })
    setIsSubmitting(false)

    if (error) {
      toast.error(
        'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Zugangsdaten.'
      )
      return
    }

    const signInData = data as { twoFactorRedirect?: boolean } | null
    if (signInData?.twoFactorRedirect) {
      goToStep('totp')
      return
    }

    toast.success('Erfolgreich angemeldet.')
    router.push('/lecturers')
    router.refresh()
  }

  const handleTotpVerification = async () => {
    if (totpCode.length !== 6) {
      toast.error('Bitte geben Sie einen gültigen 6-stelligen Code ein.')
      return
    }

    setIsSubmitting(true)
    const { error } = await authClient.twoFactor.verifyTotp({ code: totpCode })
    setIsSubmitting(false)

    if (error) {
      toast.error('2FA-Verifizierung fehlgeschlagen. Bitte erneut versuchen.')
      setTotpCode('')
      return
    }

    toast.success('Erfolgreich angemeldet.')
    router.push('/lecturers')
    router.refresh()
  }

  const handleBackupCodeVerification = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    const code = backupCode.trim()

    if (!code) {
      toast.error('Bitte geben Sie einen Backup-Code ein.')
      return
    }

    setIsSubmitting(true)
    const { error } = await authClient.twoFactor.verifyBackupCode({ code })
    setIsSubmitting(false)

    if (error) {
      toast.error('Ungültiger Backup-Code. Bitte erneut versuchen.')
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
                {step === 'credentials'
                  ? 'Melden Sie sich mit Ihrem Konto an'
                  : step === 'totp'
                    ? 'Geben Sie Ihren Authentifizierungscode ein'
                    : 'Geben Sie einen Backup-Code ein'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="-mx-1 overflow-hidden px-1 -mt-1 pt-1">
              <div
                className="flex w-[300%] transition-transform duration-300 ease-in-out"
                style={{ transform: SLIDE[step] }}>
                {/* Step 1 – Credentials */}
                <div className="w-1/3 shrink-0 pr-1">
                  <form onSubmit={handleSignIn}>
                    <FieldGroup className="gap-6">
                      <Button
                        variant="outline"
                        type="button"
                        className="text-sm text-medium text-card-foreground gap-2 dark:bg-background rounded-lg h-9 shadow-xs cursor-pointer"
                        onClick={() =>
                          toast.error(
                            'Microsoft Login ist derzeit nicht verfügbar'
                          )
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
                              <sup className="text-destructive text-sm font-normal">
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
                              <sup className="text-destructive text-sm font-normal">
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
                          size="lg"
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
                </div>

                {/* Step 2 – TOTP */}
                <div className="w-1/3 shrink-0 px-1">
                  <FieldGroup className="gap-6">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={totpCode}
                        onChange={(val) => setTotpCode(val.replace(/\D/g, ''))}
                        onComplete={handleTotpVerification}
                        disabled={isSubmitting}
                        inputMode="numeric"
                        pattern="[0-9]*">
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-2">
                      <p className="text-xs text-muted-foreground">
                        Keinen Zugriff auf Ihre Authenticator-App?{' '}
                        <button
                          type="button"
                          disabled={isSubmitting}
                          className="text-foreground underline underline-offset-4 hover:text-foreground/70 transition-colors cursor-pointer disabled:opacity-50"
                          onClick={() => goToStep('backup')}>
                          Backup-Code verwenden
                        </button>
                      </p>
                      <Button
                        type="button"
                        variant={'ghost'}
                        size={'sm'}
                        disabled={isSubmitting}
                        className={'text-muted-foreground'}
                        onClick={() => {
                          goToStep('credentials')
                          setBackupCode('')
                        }}>
                        ← Zurück
                      </Button>
                    </div>
                  </FieldGroup>
                </div>

                {/* Step 3 – Backup Code */}
                <div className="w-1/3 shrink-0 pl-1">
                  <form onSubmit={handleBackupCodeVerification}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="backup-code">
                          Backup-Code
                        </FieldLabel>
                        <Input
                          ref={backupInputRef}
                          id="backup-code"
                          name="backup-code"
                          value={backupCode}
                          onChange={(e) => setBackupCode(e.target.value)}
                          required
                          className="font-mono"
                          placeholder="PRVD-XXXX-XXXX"
                        />
                        <p className="text-xs text-muted-foreground">
                          Jeder Backup-Code kann nur einmal verwendet werden -
                          bewahren Sie sie an einem sicheren Ort auf.
                        </p>
                      </Field>
                      <Field>
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                          Backup-Code bestätigen
                        </Button>
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            variant={'ghost'}
                            size={'sm'}
                            disabled={isSubmitting}
                            className={'text-muted-foreground'}
                            onClick={() => {
                              goToStep('totp')
                              setBackupCode('')
                            }}>
                            ← Zurück
                          </Button>
                        </div>
                      </Field>
                    </FieldGroup>
                  </form>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default LoginForm
