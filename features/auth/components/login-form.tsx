'use client'

import { Check, EyeIcon, EyeOffIcon, LogIn } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ThemeToggle } from '@/features/app'
import { toCanonicalBackupCode } from '@/features/auth/lib/backup-code-format'
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
import { Spinner } from '@/features/shared/components/ui/spinner'

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
  const [showPassword, setShowPassword] = useState(false)
  const backupInputRef = useRef<HTMLInputElement>(null)
  const otpInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'totp') {
      setTimeout(() => otpInputRef.current?.focus(), 350)
    }
  }, [step])

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
      setTimeout(() => otpInputRef.current?.focus(), 0)
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
    const rawCode = backupCode.trim()

    if (!rawCode) {
      toast.error('Bitte geben Sie einen Backup-Code ein.')
      return
    }

    const canonicalCode = toCanonicalBackupCode(rawCode)

    setIsSubmitting(true)
    const primaryAttempt = await authClient.twoFactor.verifyBackupCode({
      code: canonicalCode ?? rawCode,
    })

    if (primaryAttempt.error && canonicalCode && canonicalCode !== rawCode) {
      const fallbackAttempt = await authClient.twoFactor.verifyBackupCode({
        code: rawCode,
      })
      setIsSubmitting(false)

      if (fallbackAttempt.error) {
        toast.error('Ungültiger Backup-Code. Bitte erneut versuchen.')
        return
      }
    } else {
      setIsSubmitting(false)

      if (primaryAttempt.error) {
        toast.error('Ungültiger Backup-Code. Bitte erneut versuchen.')
        return
      }
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
            <div className="overflow-hidden">
              <div
                className="flex w-[300%] transition-transform duration-300 ease-in-out"
                style={{ transform: SLIDE[step] }}>
                {/* Step 1 – Credentials */}
                <div className="w-1/3 shrink-0 px-1">
                  <form onSubmit={handleSignIn}>
                    <FieldGroup className="gap-6">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() =>
                          toast.error(
                            'Microsoft Login ist derzeit nicht verfügbar'
                          )
                        }>
                        <Image
                          src={'/microsoft.svg'}
                          alt={'Microsoft Logo'}
                          width={20}
                          height={20}
                          className="size-5"
                        />
                        Anmelden mit Microsoft
                      </Button>
                      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-sm text-muted-foreground bg-transparent">
                        <span className="px-4">oder anmelden mit</span>
                      </FieldSeparator>
                      <div className="flex flex-col gap-4">
                        <Field>
                          <FieldLabel htmlFor="email">
                            <div>
                              E-Mail
                              <sup className="text-destructive">*</sup>
                            </div>
                          </FieldLabel>
                          <Input
                            id="email"
                            name="email"
                            disabled={isSubmitting}
                            type="email"
                            placeholder="mail@provadis-hochschule.de"
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="password">
                            <div>
                              Passwort
                              <sup className="text-destructive">*</sup>
                            </div>
                          </FieldLabel>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              disabled={isSubmitting}
                              placeholder="Geben Sie Ihr Passwort ein"
                              className="pr-9"
                            />
                            <Button
                              className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              size="icon"
                              type="button"
                              disabled={isSubmitting}
                              variant="ghost">
                              {showPassword ? (
                                <EyeOffIcon className="text-muted-foreground" />
                              ) : (
                                <EyeIcon className="text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </Field>
                      </div>
                      <Field className="gap-4">
                        <Button type="submit" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? <Spinner /> : <LogIn />}
                          Anmelden
                        </Button>
                        <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                          Sie haben noch kein Konto?{' '}
                          <a
                            href={`mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''}`}
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
                  <FieldGroup className="gap-6 pt-2">
                    <div className="flex justify-center">
                      <InputOTP
                        ref={otpInputRef}
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
                <div className="w-1/3 shrink-0 px-1">
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
                          {isSubmitting ? <Spinner /> : <Check />}
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
