'use client'

import {
  KeyRoundIcon,
  LockIcon,
  PencilIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  TrashIcon,
  UserIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { deleteAccount } from '@/features/auth/actions/delete-account'
import { getBackupCodeCount } from '@/features/auth/actions/get-backup-code-count'
import { updateProfile } from '@/features/auth/actions/update-profile'
import { ChangePasswordDialog } from '@/features/auth/components/dialogs/change-password-dialog'
import { EditFieldDialog } from '@/features/auth/components/dialogs/edit-field-dialog'
import { PasswordDialog } from '@/features/auth/components/dialogs/password-dialog'
import { RegenerateBackupCodesDialog } from '@/features/auth/components/dialogs/regenerate-backup-codes-dialog'
import { TwoFactorDisableDialog } from '@/features/auth/components/dialogs/two-factor-disable-dialog'
import { TwoFactorSetupDialog } from '@/features/auth/components/dialogs/two-factor-setup-dialog'
import { formatBackupCodes } from '@/features/auth/lib/backup-code-format'
import { authClient } from '@/features/auth/lib/client'
import { AccountUser } from '@/features/auth/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/features/shared/components/ui/avatar'
import { Button } from '@/features/shared/components/ui/button'
import { Separator } from '@/features/shared/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import { dispatchUserProfileUpdated } from '@/features/shared/lib/user-profile-sync'

type AccountSettingsProps = {
  initialUser: AccountUser
  onUserChange?: (user: AccountUser) => void
}

export function AccountSettings({
  initialUser,
  onUserChange,
}: AccountSettingsProps) {
  const [saved, setSaved] = useState<AccountUser>(initialUser)
  const [isSaving, setIsSaving] = useState(false)

  const [showNameDialog, setShowNameDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [fieldInput, setFieldInput] = useState('')

  const twoFactorEnabledRef = useRef(initialUser.twoFactorEnabled)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    initialUser.twoFactorEnabled
  )

  const [showEnablePasswordDialog, setShowEnablePasswordDialog] =
    useState(false)
  const [isEnabling, setIsEnabling] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [setupTotpUri, setSetupTotpUri] = useState('')
  const [setupBackupCodes, setSetupBackupCodes] = useState<string[]>([])
  const [isVerifyingSetup, setIsVerifyingSetup] = useState(false)

  const [showDisablePasswordDialog, setShowDisablePasswordDialog] =
    useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [isDisabling, setIsDisabling] = useState(false)

  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false)
  const [backupCodeCount, setBackupCodeCount] = useState<number | null>(null)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (twoFactorEnabled) {
      getBackupCodeCount().then(setBackupCodeCount)
    }
  }, [twoFactorEnabled])

  const refreshBackupCodeCount = async () => {
    const count = await getBackupCodeCount()
    setBackupCodeCount(count)
    return count
  }

  const notifyUserUpdated = (
    updated: AccountUser,
    backupCodeCount?: number
  ) => {
    onUserChange?.(updated)
    dispatchUserProfileUpdated({
      ...updated,
      ...(backupCodeCount === undefined ? {} : { backupCodeCount }),
    })
  }

  const handleDeleteAccount = async (password: string) => {
    setIsDeleting(true)
    try {
      const promise = deleteAccount(password).then(() => {
        router.push('/login')
        router.refresh()
      })

      toast.promise(promise, {
        loading: 'Konto wird gelöscht...',
        success: 'Konto wurde gelöscht.',
        error: (error: unknown) =>
          error instanceof Error
            ? error.message
            : 'Konto konnte nicht gelöscht werden.',
      })

      await promise
    } catch {
      // Error already handled by toast
    } finally {
      setIsDeleting(false)
      setShowDeleteAccountDialog(false)
    }
  }

  const patchProfile = async (
    patch: Partial<Pick<AccountUser, 'name' | 'email' | 'image'>>,
    messages: { loading: string; success: string }
  ): Promise<boolean> => {
    if (isSaving) return false

    setIsSaving(true)
    try {
      const updatePromise = updateProfile(patch).then((result) => {
        if (result.error) {
          throw new Error(result.error)
        }
        if (!result.user) {
          throw new Error('Konnte nicht gespeichert werden.')
        }
        return result.user
      })

      toast.promise(updatePromise, {
        loading: messages.loading,
        success: messages.success,
        error: (error: unknown) =>
          error instanceof Error
            ? error.message
            : 'Konnte nicht gespeichert werden.',
      })

      const user = await updatePromise
      const updated: AccountUser = {
        id: user.id,
        name: user.name.trim() ? user.name : saved.name || 'Benutzer',
        email: user.email.trim() ? user.email : saved.email,
        image: user.image ?? null,
        twoFactorEnabled: twoFactorEnabledRef.current,
      }
      setSaved(updated)
      notifyUserUpdated(updated)
      return true
    } catch {
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleNameSave = async () => {
    const next = fieldInput.trim()
    if (!next) {
      toast.error('Bitte geben Sie einen Namen ein.')
      return
    }
    const didSave = await patchProfile(
      { name: next },
      {
        loading: 'Name wird gespeichert...',
        success: 'Name gespeichert.',
      }
    )
    if (didSave) {
      setShowNameDialog(false)
    }
  }

  const handleEmailSave = async () => {
    const next = fieldInput.trim()
    if (!next) {
      toast.error('Bitte geben Sie eine E-Mail ein.')
      return
    }
    const didSave = await patchProfile(
      { email: next },
      {
        loading: 'E-Mail wird gespeichert...',
        success: 'E-Mail gespeichert.',
      }
    )
    if (didSave) {
      setShowEmailDialog(false)
    }
  }

  const handleImageSave = async () => {
    const next = fieldInput.trim() || null
    const didSave = await patchProfile(
      { image: next },
      {
        loading: 'Profilbild wird gespeichert...',
        success: 'Profilbild gespeichert.',
      }
    )
    if (didSave) {
      setShowImageDialog(false)
    }
  }

  const handleEnableConfirm = async (password: string) => {
    setIsEnabling(true)
    try {
      const enablePromise = authClient.twoFactor
        .enable({ password })
        .then(({ data, error }) => {
          if (error) {
            throw new Error('2FA konnte nicht aktiviert werden.')
          }
          return (data ?? null) as {
            totpURI?: string
            backupCodes?: string[]
          } | null
        })

      toast.promise(enablePromise, {
        loading: '2FA-Einrichtung wird gestartet...',
        success: '2FA-Einrichtung gestartet.',
        error: (error: unknown) =>
          error instanceof Error
            ? error.message
            : '2FA konnte nicht aktiviert werden.',
      })

      const payload = await enablePromise
      setSetupTotpUri(payload?.totpURI ?? '')
      setSetupBackupCodes(formatBackupCodes(payload?.backupCodes ?? []))
      setShowEnablePasswordDialog(false)
      setShowSetupDialog(true)
    } finally {
      setIsEnabling(false)
    }
  }

  const handleVerifySetup = async (code: string): Promise<boolean> => {
    setIsVerifyingSetup(true)
    const { error } = await authClient.twoFactor.verifyTotp({ code })
    setIsVerifyingSetup(false)
    if (error) {
      toast.error('2FA-Verifizierung fehlgeschlagen.')
      return false
    }
    return true
  }

  const handleDisablePasswordConfirm = async (password: string) => {
    setDisablePassword(password)
    setShowDisablePasswordDialog(false)
    setShowDisableDialog(true)
  }

  const handleDisableConfirm = async (code: string) => {
    if (!disablePassword) {
      toast.error('Bitte bestaetigen Sie zuerst Ihr Passwort.')
      setShowDisableDialog(false)
      return
    }

    setIsDisabling(true)
    try {
      const verifyResult = await authClient.twoFactor.verifyTotp({ code })
      if (verifyResult.error) {
        toast.error('2FA-Code ist ungueltig. Bitte erneut versuchen.')
        return
      }

      const disablePromise = authClient.twoFactor
        .disable({ password: disablePassword })
        .then(({ error }) => {
          if (error) {
            throw new Error('2FA konnte nicht deaktiviert werden.')
          }
        })

      toast.promise(disablePromise, {
        loading: '2FA wird deaktiviert...',
        success: '2FA wurde deaktiviert.',
        error: (error: unknown) =>
          error instanceof Error
            ? error.message
            : '2FA konnte nicht deaktiviert werden.',
      })

      await disablePromise
      twoFactorEnabledRef.current = false
      setTwoFactorEnabled(false)
      setShowDisableDialog(false)
      setDisablePassword('')
      setBackupCodeCount(0)
      const updated = { ...saved, twoFactorEnabled: false }
      notifyUserUpdated(updated, 0)
    } finally {
      setIsDisabling(false)
    }
  }

  const displayName = saved.name.trim() ? saved.name : 'Benutzer'

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U'

  return (
    <>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1 gap-1.5">
            <UserIcon className="size-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 gap-1.5">
            <KeyRoundIcon className="size-4" />
            Sicherheit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar key={saved.image ?? 'no-image'} className="size-9">
                {saved.image ? (
                  <AvatarImage src={saved.image} alt={displayName} />
                ) : null}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Profilbild</p>
                <p className="text-xs text-muted-foreground truncate max-w-48">
                  {saved.image ? saved.image : 'Kein Bild gesetzt'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0"
              onClick={() => {
                setFieldInput(saved.image ?? '')
                setShowImageDialog(true)
              }}>
              <PencilIcon className="size-4" />
              Ändern
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Name</p>
              <p className="text-xs text-muted-foreground">{displayName}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0"
              onClick={() => {
                setFieldInput(saved.name)
                setShowNameDialog(true)
              }}>
              <PencilIcon className="size-4" />
              Ändern
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">E-Mail</p>
              <p className="text-xs text-muted-foreground">{saved.email}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0"
              onClick={() => {
                setFieldInput(saved.email)
                setShowEmailDialog(true)
              }}>
              <PencilIcon className="size-4" />
              Ändern
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Passwort</p>
              <p className="text-xs text-muted-foreground">
                Ändern Sie Ihr Anmelde-Passwort.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0"
              onClick={() => setShowChangePasswordDialog(true)}>
              <LockIcon className="size-4" />
              Ändern
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                Zwei-Faktor-Authentifizierung
              </p>
              <p className="text-xs text-muted-foreground">
                {twoFactorEnabled
                  ? 'Aktiviert — Ihr Konto ist zusätzlich geschützt.'
                  : 'Deaktiviert — Aktivieren Sie 2FA für mehr Sicherheit.'}
              </p>
            </div>
            {twoFactorEnabled ? (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive gap-1.5 shrink-0"
                onClick={() => setShowDisablePasswordDialog(true)}>
                <ShieldOffIcon className="size-4" />
                Deaktivieren
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 shrink-0"
                onClick={() => setShowEnablePasswordDialog(true)}>
                <ShieldCheckIcon className="size-4" />
                Aktivieren
              </Button>
            )}
          </div>

          {twoFactorEnabled && (
            <>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    Backup-Codes
                    {backupCodeCount !== null && (
                      <span
                        className={`text-xs font-normal ${
                          backupCodeCount === 0
                            ? 'text-destructive'
                            : backupCodeCount <= 4
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-muted-foreground'
                        }`}>
                        ({backupCodeCount} verbleibend)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Neu erstellen macht alle alten ungültig.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setShowRegenerateDialog(true)}>
                  Neu erstellen
                </Button>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Konto löschen</p>
              <p className="text-xs text-muted-foreground">
                Ihr Konto und alle zugehörigen Daten werden unwiderruflich
                gelöscht.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive gap-1.5 shrink-0"
              onClick={() => setShowDeleteAccountDialog(true)}>
              <TrashIcon />
              Löschen
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <EditFieldDialog
        open={showNameDialog}
        onOpenChange={setShowNameDialog}
        title="Name ändern"
        description="Geben Sie Ihren neuen Namen ein."
        placeholder="Ihr Name"
        value={fieldInput}
        onChange={setFieldInput}
        onSave={handleNameSave}
        isSaving={isSaving}
      />

      <EditFieldDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        title="E-Mail ändern"
        description="Geben Sie Ihre neue E-Mail-Adresse ein."
        inputType="email"
        placeholder="mail@example.com"
        value={fieldInput}
        onChange={setFieldInput}
        onSave={handleEmailSave}
        isSaving={isSaving}
      />

      <EditFieldDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        title="Profilbild ändern"
        description="Geben Sie einen Link zu einem öffentlich zugänglichen Bild ein."
        inputType="url"
        placeholder="https://example.com/avatar.png"
        value={fieldInput}
        onChange={setFieldInput}
        onSave={handleImageSave}
        isSaving={isSaving}
      />

      <ChangePasswordDialog
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />

      <PasswordDialog
        open={showEnablePasswordDialog}
        onOpenChange={setShowEnablePasswordDialog}
        title="2FA aktivieren"
        description="Bestätigen Sie Ihr Passwort, um die Zwei-Faktor-Authentifizierung einzurichten."
        confirmLabel="Weiter"
        isLoading={isEnabling}
        onConfirm={handleEnableConfirm}
      />

      <TwoFactorSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        totpUri={setupTotpUri}
        backupCodes={setupBackupCodes}
        onVerify={handleVerifySetup}
        onDone={() => {
          twoFactorEnabledRef.current = true
          const nextBackupCodeCount = setupBackupCodes.length
          setBackupCodeCount(nextBackupCodeCount)
          setTwoFactorEnabled(true)
          setShowSetupDialog(false)
          const updated = { ...saved, twoFactorEnabled: true }
          notifyUserUpdated(updated, nextBackupCodeCount)
          void refreshBackupCodeCount()
          toast.success('2FA wurde aktiviert.')
        }}
        isVerifying={isVerifyingSetup}
      />

      <PasswordDialog
        open={showDisablePasswordDialog}
        onOpenChange={(open) => {
          setShowDisablePasswordDialog(open)
          if (!open) {
            setDisablePassword('')
          }
        }}
        title="2FA deaktivieren"
        description="Bestaetigen Sie Ihr Passwort, um fortzufahren."
        confirmLabel="Weiter"
        confirmVariant="destructive"
        isLoading={isDisabling}
        onConfirm={handleDisablePasswordConfirm}
      />

      <TwoFactorDisableDialog
        open={showDisableDialog}
        onOpenChangeAction={(open) => {
          setShowDisableDialog(open)
          if (!open) {
            setDisablePassword('')
          }
        }}
        isLoading={isDisabling}
        onConfirmAction={handleDisableConfirm}
      />

      <RegenerateBackupCodesDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        onDone={async () => {
          const nextBackupCodeCount = await refreshBackupCodeCount()
          notifyUserUpdated(saved, nextBackupCodeCount)
        }}
      />

      <PasswordDialog
        open={showDeleteAccountDialog}
        onOpenChange={setShowDeleteAccountDialog}
        title="Konto löschen"
        description="Bestätigen Sie Ihr Passwort, um Ihr Konto unwiderruflich zu löschen."
        confirmLabel="Konto löschen"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteAccount}
      />
    </>
  )
}
