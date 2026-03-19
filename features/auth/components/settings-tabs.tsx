'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  Fingerprint,
  GithubIcon,
  InfoIcon,
  Save,
  SquareAsterisk,
  UsersIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import { saveAuthSettings } from '@/features/auth/actions/save-auth-settings'
import { githubSchema } from '@/features/auth/schemas/github'
import { microsoftSchema } from '@/features/auth/schemas/microsoft'
import { oauthSchema } from '@/features/auth/schemas/oauth'
import type {
  AuthSettingsData,
  ProviderUserCounts,
} from '@/features/auth/types'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Card, CardContent } from '@/features/shared/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field'
import { Input } from '@/features/shared/components/ui/input'
import { Separator } from '@/features/shared/components/ui/separator'
import { Spinner } from '@/features/shared/components/ui/spinner'
import { Switch } from '@/features/shared/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'

const SECRET_PLACEHOLDER = '••••••••••••••••'

type SettingsTabsProps = {
  initialSettings: AuthSettingsData
  userCounts: ProviderUserCounts
  baseUrl: string
}

function UserCountBadge({ count }: { count: number }) {
  return (
    <Badge variant="secondary" className="gap-1 text-xs font-normal">
      <UsersIcon className="size-3" />
      {count}
    </Badge>
  )
}

function CopyableUrl({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <code className="bg-muted flex-1 truncate rounded-md px-3 py-2 font-mono text-xs select-all">
          {url}
        </code>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleCopy}>
          {copied ? (
            <CheckIcon className="size-4 text-green-500" />
          ) : (
            <ClipboardIcon className="size-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

function CallbackUrlInfo({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 mt-4 rounded-lg border p-4">
      <div className="mb-3 flex items-center gap-2">
        <InfoIcon className="text-muted-foreground size-4" />
        <p className="text-sm font-medium">Einrichtungsinformationen</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export function SettingsTabs({
  initialSettings,
  userCounts,
  baseUrl,
}: SettingsTabsProps) {
  const router = useRouter()

  // --- Password tab state ---
  const [passwordLoginEnabled, setPasswordLoginEnabled] = useState(
    initialSettings.passwordEnabled
  )
  const [passkeyLoginEnabled, setPasskeyLoginEnabled] = useState(
    initialSettings.passkeyEnabled
  )
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // --- Microsoft tab state ---
  const [microsoftEnabled, setMicrosoftEnabled] = useState(
    initialSettings.microsoftEnabled
  )
  const [isSavingMicrosoft, setIsSavingMicrosoft] = useState(false)
  const [showMicrosoftSecret, setShowMicrosoftSecret] = useState(false)

  // --- GitHub tab state ---
  const [githubEnabled, setGithubEnabled] = useState(
    initialSettings.githubEnabled
  )
  const [isSavingGithub, setIsSavingGithub] = useState(false)
  const [showGithubSecret, setShowGithubSecret] = useState(false)

  // --- OAuth tab state ---
  const [oauthEnabled, setOauthEnabled] = useState(initialSettings.oauthEnabled)
  const [isSavingOauth, setIsSavingOauth] = useState(false)
  const [showOauthSecret, setShowOauthSecret] = useState(false)

  // --- Count total enabled methods for "at least one" enforcement ---
  const enabledCount = [
    passwordLoginEnabled,
    passkeyLoginEnabled,
    microsoftEnabled,
    githubEnabled,
    oauthEnabled,
  ].filter(Boolean).length

  // --- Forms ---
  const microsoftForm = useForm<z.infer<typeof microsoftSchema>>({
    resolver: zodResolver(microsoftSchema),
    defaultValues: {
      clientId: initialSettings.microsoftClientId,
      clientSecret: '',
      tenantId: initialSettings.microsoftTenantId,
    },
  })

  const githubForm = useForm<z.infer<typeof githubSchema>>({
    resolver: zodResolver(githubSchema),
    defaultValues: {
      clientId: initialSettings.githubClientId,
      clientSecret: '',
    },
  })

  const oauthForm = useForm<z.infer<typeof oauthSchema>>({
    resolver: zodResolver(oauthSchema),
    defaultValues: {
      clientId: initialSettings.oauthClientId,
      clientSecret: '',
      issuerUrl: initialSettings.oauthIssuerUrl,
    },
  })

  // --- Helpers ---
  function wouldDisableLast(toggleOff: boolean): boolean {
    return toggleOff && enabledCount <= 1
  }

  // --- Dirty checking ---
  const hasPasswordChanges =
    passwordLoginEnabled !== initialSettings.passwordEnabled ||
    passkeyLoginEnabled !== initialSettings.passkeyEnabled

  const hasMicrosoftChanges =
    microsoftEnabled !== initialSettings.microsoftEnabled ||
    microsoftForm.formState.isDirty

  const hasGithubChanges =
    githubEnabled !== initialSettings.githubEnabled ||
    githubForm.formState.isDirty

  const hasOauthChanges =
    oauthEnabled !== initialSettings.oauthEnabled || oauthForm.formState.isDirty

  // --- Handlers ---
  async function handlePasswordSave() {
    setIsSavingPassword(true)
    try {
      await saveAuthSettings({
        passwordEnabled: passwordLoginEnabled,
        passkeyEnabled: passkeyLoginEnabled,
        microsoftEnabled,
        githubEnabled,
        oauthEnabled,
      })
      toast.success('Passwort-Einstellungen gespeichert')
      router.refresh()
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Fehler beim Speichern der Passwort-Einstellungen'
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  async function handleMicrosoftSubmit(data: z.infer<typeof microsoftSchema>) {
    setIsSavingMicrosoft(true)
    try {
      await saveAuthSettings({
        passwordEnabled: passwordLoginEnabled,
        passkeyEnabled: passkeyLoginEnabled,
        microsoftEnabled,
        microsoftClientId: data.clientId,
        microsoftClientSecret: data.clientSecret || undefined,
        microsoftTenantId: data.tenantId,
        githubEnabled,
        oauthEnabled,
      })
      toast.success('Microsoft-Einstellungen gespeichert')
      microsoftForm.setValue('clientSecret', '')
      router.refresh()
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Fehler beim Speichern der Microsoft-Einstellungen'
      )
    } finally {
      setIsSavingMicrosoft(false)
    }
  }

  async function handleGithubSubmit(data: z.infer<typeof githubSchema>) {
    setIsSavingGithub(true)
    try {
      await saveAuthSettings({
        passwordEnabled: passwordLoginEnabled,
        passkeyEnabled: passkeyLoginEnabled,
        microsoftEnabled,
        githubEnabled,
        githubClientId: data.clientId,
        githubClientSecret: data.clientSecret || undefined,
        oauthEnabled,
      })
      toast.success('GitHub-Einstellungen gespeichert')
      githubForm.setValue('clientSecret', '')
      router.refresh()
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Fehler beim Speichern der GitHub-Einstellungen'
      )
    } finally {
      setIsSavingGithub(false)
    }
  }

  async function handleOauthSubmit(data: z.infer<typeof oauthSchema>) {
    setIsSavingOauth(true)
    try {
      await saveAuthSettings({
        passwordEnabled: passwordLoginEnabled,
        passkeyEnabled: passkeyLoginEnabled,
        microsoftEnabled,
        githubEnabled,
        oauthEnabled,
        oauthClientId: data.clientId,
        oauthClientSecret: data.clientSecret || undefined,
        oauthIssuerUrl: data.issuerUrl,
      })
      toast.success('OAuth-Einstellungen gespeichert')
      oauthForm.setValue('clientSecret', '')
      router.refresh()
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Fehler beim Speichern der OAuth-Einstellungen'
      )
    } finally {
      setIsSavingOauth(false)
    }
  }

  return (
    <Card className={'pt-0'}>
      <Tabs className={'max-w-3xl lg:w-3xl'} defaultValue={'password'}>
        <TabsList className={'w-full'}>
          <TabsTrigger value={'password'}>
            <div className={'flex items-center justify-center gap-1 px-2'}>
              <SquareAsterisk className={'hidden sm:block'} />
              <span>Passwort</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value={'microsoft'}>
            <div
              className={'flex items-center justify-center gap-1 px-1 sm:px-2'}>
              <Image
                src={'/microsoft.svg'}
                alt={'Microsoft Logo'}
                width={16}
                height={16}
                className="hidden size-4 sm:block"
              />
              <span>Microsoft</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value={'github'}>
            <div className={'flex items-center justify-center gap-1 px-2'}>
              <GithubIcon className="hidden sm:block" />
              <span>GitHub</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value={'oauth'}>
            <div className={'flex items-center justify-center gap-1 px-2'}>
              <Fingerprint className="hidden sm:block" />
              <span>OAuth</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <CardContent>
          {/* ===== PASSWORD TAB ===== */}
          <TabsContent value={'password'}>
            <div className={'flex items-center justify-between'}>
              <div className={'flex items-center gap-2 py-2'}>
                <div>
                  <p className={'text-sm'}>Passwort Login erlauben</p>
                  <p className={'text-muted-foreground text-xs'}>
                    Wenn aktiviert, können sich Benutzer mit ihrem Passwort
                    anmelden.
                  </p>
                </div>
                <UserCountBadge count={userCounts.password} />
              </div>
              <div className={'p-2'}>
                <Switch
                  checked={passwordLoginEnabled}
                  onCheckedChange={(v) => {
                    if (!v && wouldDisableLast(true)) {
                      toast.error(
                        'Mindestens eine Anmeldemethode muss aktiviert bleiben.'
                      )
                      return
                    }
                    setPasswordLoginEnabled(v)
                  }}
                />
              </div>
            </div>
            <Separator />
            <div className={'flex items-center justify-between'}>
              <div className={'flex items-center gap-2 py-2'}>
                <div>
                  <p className={'text-sm'}>Passkey Login erlauben</p>
                  <p className={'text-muted-foreground text-xs'}>
                    Wenn aktiviert, können sich Benutzer mit Passkeys anmelden.
                  </p>
                </div>
                <UserCountBadge count={userCounts.passkey} />
              </div>
              <div className={'p-2'}>
                <Switch
                  checked={passkeyLoginEnabled}
                  onCheckedChange={(v) => {
                    if (!v && wouldDisableLast(true)) {
                      toast.error(
                        'Mindestens eine Anmeldemethode muss aktiviert bleiben.'
                      )
                      return
                    }
                    setPasskeyLoginEnabled(v)
                  }}
                />
              </div>
            </div>
            <Separator />
            <div className={'flex justify-end pt-4'}>
              <Button
                onClick={handlePasswordSave}
                disabled={isSavingPassword || !hasPasswordChanges}
                size={'sm'}>
                {isSavingPassword ? <Spinner /> : <Save />}
                Speichern
              </Button>
            </div>
          </TabsContent>

          {/* ===== MICROSOFT TAB ===== */}
          <TabsContent value={'microsoft'}>
            <div className={'flex items-center justify-between'}>
              <div className={'flex items-center gap-2 py-2'}>
                <div>
                  <p className={'text-sm'}>Microsoft Login erlauben</p>
                  <p className={'text-muted-foreground text-xs'}>
                    Ermöglicht die Anmeldung über Microsoft-Konten.
                  </p>
                </div>
                <UserCountBadge count={userCounts.microsoft} />
              </div>
              <div className={'p-2'}>
                <Switch
                  checked={microsoftEnabled}
                  onCheckedChange={(v) => {
                    if (!v && wouldDisableLast(true)) {
                      toast.error(
                        'Mindestens eine Anmeldemethode muss aktiviert bleiben.'
                      )
                      return
                    }
                    setMicrosoftEnabled(v)
                  }}
                />
              </div>
            </div>
            <Separator />
            <CallbackUrlInfo>
              <CopyableUrl
                label="Redirect URI (für Azure App Registration)"
                url={`${baseUrl}/api/auth/callback/microsoft`}
              />
            </CallbackUrlInfo>
            <form
              onSubmit={microsoftForm.handleSubmit(handleMicrosoftSubmit)}
              className={'space-y-4 pt-4'}>
              <FieldGroup>
                <Controller
                  name={'clientId'}
                  control={microsoftForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ms-clientId">Client ID</FieldLabel>
                      <Input
                        id="ms-clientId"
                        placeholder="Ihre Microsoft Client ID"
                        disabled={!microsoftEnabled}
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
                  name={'clientSecret'}
                  control={microsoftForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ms-clientSecret" className={'gap-1'}>
                        Client Secret
                        {initialSettings.microsoftHasSecret && (
                          <span className="text-muted-foreground text-xs font-normal">
                            (gespeichert)
                          </span>
                        )}
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="ms-clientSecret"
                          type={showMicrosoftSecret ? 'text' : 'password'}
                          placeholder={
                            initialSettings.microsoftHasSecret
                              ? SECRET_PLACEHOLDER
                              : 'Ihr Microsoft Client Secret'
                          }
                          className="pr-9"
                          disabled={!microsoftEnabled}
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete={'off'}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                          onClick={() =>
                            setShowMicrosoftSecret(!showMicrosoftSecret)
                          }
                          size="icon"
                          type="button"
                          variant="ghost">
                          {showMicrosoftSecret ? (
                            <EyeOffIcon className="text-muted-foreground" />
                          ) : (
                            <EyeIcon className="text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={'tenantId'}
                  control={microsoftForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ms-tenantId">Tenant ID</FieldLabel>
                      <Input
                        id="ms-tenantId"
                        placeholder="Ihre Microsoft Tenant ID"
                        disabled={!microsoftEnabled}
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
              </FieldGroup>
              <div className={'flex justify-end'}>
                <Button
                  type={
                    !microsoftEnabled && !microsoftForm.formState.isDirty
                      ? 'button'
                      : 'submit'
                  }
                  size={'sm'}
                  disabled={isSavingMicrosoft || !hasMicrosoftChanges}
                  onClick={
                    !microsoftEnabled && !microsoftForm.formState.isDirty
                      ? () => handleMicrosoftSubmit(microsoftForm.getValues())
                      : undefined
                  }>
                  {isSavingMicrosoft ? <Spinner /> : <Save />}
                  Speichern
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ===== GITHUB TAB ===== */}
          <TabsContent value={'github'}>
            <div className={'flex items-center justify-between'}>
              <div className={'flex items-center gap-2 py-2'}>
                <div>
                  <p className={'text-sm'}>GitHub Login erlauben</p>
                  <p className={'text-muted-foreground text-xs'}>
                    Ermöglicht die Anmeldung über GitHub-Konten.
                  </p>
                </div>
                <UserCountBadge count={userCounts.github} />
              </div>
              <div className={'p-2'}>
                <Switch
                  checked={githubEnabled}
                  onCheckedChange={(v) => {
                    if (!v && wouldDisableLast(true)) {
                      toast.error(
                        'Mindestens eine Anmeldemethode muss aktiviert bleiben.'
                      )
                      return
                    }
                    setGithubEnabled(v)
                  }}
                />
              </div>
            </div>
            <Separator />
            <CallbackUrlInfo>
              <CopyableUrl
                label="Authorization callback URL (für GitHub OAuth App)"
                url={`${baseUrl}/api/auth/callback/github`}
              />
              <CopyableUrl label="Homepage URL" url={baseUrl} />
            </CallbackUrlInfo>
            <form
              onSubmit={githubForm.handleSubmit(handleGithubSubmit)}
              className={'space-y-4 pt-4'}>
              <FieldGroup>
                <Controller
                  name={'clientId'}
                  control={githubForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="gh-clientId">Client ID</FieldLabel>
                      <Input
                        id="gh-clientId"
                        placeholder="Ihre GitHub Client ID"
                        disabled={!githubEnabled}
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
                  name={'clientSecret'}
                  control={githubForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="gh-clientSecret" className={'gap-1'}>
                        Client Secret
                        {initialSettings.githubHasSecret && (
                          <span className="text-muted-foreground text-xs font-normal">
                            (gespeichert)
                          </span>
                        )}
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="gh-clientSecret"
                          type={showGithubSecret ? 'text' : 'password'}
                          placeholder={
                            initialSettings.githubHasSecret
                              ? SECRET_PLACEHOLDER
                              : 'Ihr GitHub Client Secret'
                          }
                          className="pr-9"
                          disabled={!githubEnabled}
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete={'off'}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                          onClick={() => setShowGithubSecret(!showGithubSecret)}
                          size="icon"
                          type="button"
                          variant="ghost">
                          {showGithubSecret ? (
                            <EyeOffIcon className="text-muted-foreground" />
                          ) : (
                            <EyeIcon className="text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <div className={'flex justify-end'}>
                <Button
                  type={
                    !githubEnabled && !githubForm.formState.isDirty
                      ? 'button'
                      : 'submit'
                  }
                  size={'sm'}
                  disabled={isSavingGithub || !hasGithubChanges}
                  onClick={
                    !githubEnabled && !githubForm.formState.isDirty
                      ? () => handleGithubSubmit(githubForm.getValues())
                      : undefined
                  }>
                  {isSavingGithub ? <Spinner /> : <Save />}
                  Speichern
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ===== OAUTH TAB ===== */}
          <TabsContent value={'oauth'}>
            <div className={'flex items-center justify-between'}>
              <div className={'flex items-center gap-2 py-2'}>
                <div>
                  <p className={'text-sm'}>Generischen OAuth Login erlauben</p>
                  <p className={'text-muted-foreground text-xs'}>
                    Ermöglicht die Anmeldung über einen eigenen OAuth2-Provider.
                  </p>
                </div>
                <UserCountBadge count={userCounts.oauth} />
              </div>
              <div className={'p-2'}>
                <Switch
                  checked={oauthEnabled}
                  onCheckedChange={(v) => {
                    if (!v && wouldDisableLast(true)) {
                      toast.error(
                        'Mindestens eine Anmeldemethode muss aktiviert bleiben.'
                      )
                      return
                    }
                    setOauthEnabled(v)
                  }}
                />
              </div>
            </div>
            <Separator />
            <CallbackUrlInfo>
              <CopyableUrl
                label="Redirect / Callback URI (für Ihren OAuth2-Provider)"
                url={`${baseUrl}/api/auth/callback/oauth`}
              />
            </CallbackUrlInfo>
            <form
              onSubmit={oauthForm.handleSubmit(handleOauthSubmit)}
              className={'space-y-4 pt-4'}>
              <FieldGroup>
                <Controller
                  name={'issuerUrl'}
                  control={oauthForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="oauth-issuerUrl">
                        Issuer URL
                      </FieldLabel>
                      <Input
                        id="oauth-issuerUrl"
                        placeholder="https://auth.example.com"
                        disabled={!oauthEnabled}
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
                  name={'clientId'}
                  control={oauthForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="oauth-clientId">
                        Client ID
                      </FieldLabel>
                      <Input
                        id="oauth-clientId"
                        placeholder="Ihre OAuth Client ID"
                        disabled={!oauthEnabled}
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
                  name={'clientSecret'}
                  control={oauthForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="oauth-clientSecret"
                        className={'gap-1'}>
                        Client Secret
                        {initialSettings.oauthHasSecret && (
                          <span className="text-muted-foreground text-xs font-normal">
                            (gespeichert)
                          </span>
                        )}
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id="oauth-clientSecret"
                          type={showOauthSecret ? 'text' : 'password'}
                          placeholder={
                            initialSettings.oauthHasSecret
                              ? SECRET_PLACEHOLDER
                              : 'Ihr OAuth Client Secret'
                          }
                          className="pr-9"
                          disabled={!oauthEnabled}
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete={'off'}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:!bg-transparent"
                          onClick={() => setShowOauthSecret(!showOauthSecret)}
                          size="icon"
                          type="button"
                          variant="ghost">
                          {showOauthSecret ? (
                            <EyeOffIcon className="text-muted-foreground" />
                          ) : (
                            <EyeIcon className="text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <div className={'flex justify-end'}>
                <Button
                  type={
                    !oauthEnabled && !oauthForm.formState.isDirty
                      ? 'button'
                      : 'submit'
                  }
                  size={'sm'}
                  disabled={isSavingOauth || !hasOauthChanges}
                  onClick={
                    !oauthEnabled && !oauthForm.formState.isDirty
                      ? () => handleOauthSubmit(oauthForm.getValues())
                      : undefined
                  }>
                  {isSavingOauth ? <Spinner /> : <Save />}
                  Speichern
                </Button>
              </div>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
