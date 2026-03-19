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

import { invalidateUsersCache } from '@/features/access-control/actions/invalidate-users-cache'
import { deleteAccount } from '@/features/auth/actions/delete-account'
import { getBackupCodeCount } from '@/features/auth/actions/get-backup-code-count'
import { updateProfile } from '@/features/auth/actions/update-profile'
import { ChangePasswordDialog } from '@/features/auth/components/dialogs/change-password-dialog'
import { EditFieldDialog } from '@/features/auth/components/dialogs/edit-field-dialog'
import { PasskeyManagementDialog } from '@/features/auth/components/dialogs/passkey-management-dialog'
import { PasswordDialog } from '@/features/auth/components/dialogs/password-dialog'
import { RegenerateBackupCodesDialog } from '@/features/auth/components/dialogs/regenerate-backup-codes-dialog'
import { TwoFactorDisableDialog } from '@/features/auth/components/dialogs/two-factor-disable-dialog'
import { TwoFactorSetupDialog } from '@/features/auth/components/dialogs/two-factor-setup-dialog'
import { formatBackupCodes } from '@/features/auth/lib/backup-code-format'
import { authClient } from '@/features/auth/lib/client'
import { AccountUser, PublicAuthSettings } from '@/features/auth/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/features/shared/components/ui/avatar'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { Separator } from '@/features/shared/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'
import {
  dispatchUserProfileUpdated,
  type UserProfileUpdatedDetail,
} from '@/features/shared/lib/user-profile-sync'
import { initialsFromName } from '@/features/shared/lib/utils'

type AccountSettingsProps = {
  initialUser: AccountUser
  hasPassword: boolean
  authSettings?: PublicAuthSettings
  onUserChange?: (user: AccountUser) => void
}

type PasskeyListItem = {
  id: string
}

export function AccountSettings({
  initialUser,
  hasPassword: initialHasPassword,
  authSettings,
  onUserChange,
}: AccountSettingsProps) {
  const [saved, setSaved] = useState<AccountUser>(initialUser)
  const [isSaving, setIsSaving] = useState(false)
  const [hasPassword, setHasPassword] = useState(initialHasPassword)

  const [showNameDialog, setShowNameDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showAddPasswordDialog, setShowAddPasswordDialog] = useState(false)
  const [isAddingPassword, setIsAddingPassword] = useState(false)
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
  const [showPasskeyManagementDialog, setShowPasskeyManagementDialog] =
    useState(false)
  const {
    data: passkeys,
    isPending: isPasskeysPending,
    refetch: refetchPasskeys,
  } = authClient.useListPasskeys()
  const router = useRouter()
  const passkeyItems = (passkeys ?? []) as PasskeyListItem[]
  const passkeyCount = passkeyItems.length

  const emitUserProfileUpdated = (
    overrides: Partial<UserProfileUpdatedDetail> = {}
  ) => {
    dispatchUserProfileUpdated({
      id: saved.id,
      name: saved.name,
      email: saved.email,
      image: saved.image,
      twoFactorEnabled: twoFactorEnabledRef.current,
      hasPasskey: passkeyCount > 0,
      ...overrides,
    })
  }

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

  const handleAddFirstPasskey = async () => {
    if (typeof window === 'undefined' || !('PublicKeyCredential' in window)) {
      toast.error('Passkeys werden von diesem Browser nicht unterstützt.')
      return
    }

    const { error } = await authClient.passkey.addPasskey({
      name: `Passkey ${new Date().toLocaleDateString('de-DE')}`,
    })

    if (error) {
      toast.error('Passkey konnte nicht hinzugefügt werden.')
      return
    }

    await refetchPasskeys()
    await invalidateUsersCache()
    emitUserProfileUpdated({ hasPasskey: true })
    toast.success('Passkey wurde hinzugefügt.')
  }

  const handleDeleteAccount = async (password?: string) => {
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
      onUserChange?.(updated)
      dispatchUserProfileUpdated({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
        twoFactorEnabled: twoFactorEnabledRef.current,
        hasPasskey: passkeyCount > 0,
      })
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

  const handleAddPassword = async (password: string) => {
    setIsAddingPassword(true)
    try {
      const { error } = await authClient.changePassword({
        newPassword: password,
        currentPassword: '',
        revokeOtherSessions: false,
      })
      if (error) {
        toast.error('Passwort konnte nicht gesetzt werden.')
        return
      }
      setHasPassword(true)
      setShowAddPasswordDialog(false)
      toast.success('Passwort wurde hinzugefügt.')
    } catch {
      toast.error('Passwort konnte nicht gesetzt werden.')
    } finally {
      setIsAddingPassword(false)
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
      await invalidateUsersCache()
      twoFactorEnabledRef.current = false
      setTwoFactorEnabled(false)
      emitUserProfileUpdated({
        twoFactorEnabled: false,
        backupCodeCount: 0,
      })
      setShowDisableDialog(false)
      setDisablePassword('')
    } finally {
      setIsDisabling(false)
    }
  }

  const displayName = saved.name.trim() ? saved.name : 'Benutzer'

  const initials = initialsFromName(displayName)

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
                <p className="text-muted-foreground max-w-48 truncate text-xs">
                  {saved.image ? saved.image : 'Kein Bild gesetzt'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
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
              <p className="text-muted-foreground text-xs">{displayName}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
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
              <p className="text-muted-foreground text-xs">{saved.email}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
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
          {(authSettings?.passwordEnabled ?? true) && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Passwort</p>
                  <p className="text-muted-foreground text-xs">
                    {hasPassword
                      ? 'Ändern Sie Ihr Anmelde-Passwort.'
                      : 'Fügen Sie ein Passwort hinzu, um sich auch per E-Mail anmelden zu können.'}
                  </p>
                </div>
                {hasPassword ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => setShowChangePasswordDialog(true)}>
                    <LockIcon className="size-4" />
                    Ändern
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => setShowAddPasswordDialog(true)}>
                    <LockIcon className="size-4" />
                    Hinzufügen
                  </Button>
                )}
              </div>

              <Separator />
            </>
          )}

          {(authSettings?.passwordEnabled ?? true) && hasPassword && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Zwei-Faktor-Authentifizierung
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {twoFactorEnabled
                      ? 'Aktiviert — Ihr Konto ist zusätzlich geschützt.'
                      : 'Deaktiviert — Aktivieren Sie 2FA für mehr Sicherheit.'}
                  </p>
                </div>
                {twoFactorEnabled ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive shrink-0 gap-1.5"
                    onClick={() => setShowDisablePasswordDialog(true)}>
                    <ShieldOffIcon className="size-4" />
                    Deaktivieren
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => setShowEnablePasswordDialog(true)}>
                    <ShieldCheckIcon className="size-4" />
                    Aktivieren
                  </Button>
                )}
              </div>

              <Separator />
            </>
          )}

          {(authSettings?.passkeyEnabled ?? true) && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Passkeys</p>
                  <p className="text-muted-foreground text-xs">
                    {isPasskeysPending
                      ? 'Passkeys werden geladen...'
                      : passkeyCount > 0
                        ? `${passkeyCount} Passkey${passkeyCount > 1 ? 's' : ''} hinterlegt.`
                        : 'Hinterlegen Sie einen Passkey für eine schnellere Anmeldung ohne Passwort.'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5"
                  onClick={() =>
                    passkeyCount > 0
                      ? setShowPasskeyManagementDialog(true)
                      : handleAddFirstPasskey()
                  }
                  disabled={isPasskeysPending}>
                  <KeyRoundIcon className="size-4" />
                  {passkeyCount > 0 ? 'Verwalten' : 'Hinzufügen'}
                </Button>
              </div>

              <Separator />
            </>
          )}

          {(authSettings?.passwordEnabled ?? true) && twoFactorEnabled && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
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
                  <p className="text-muted-foreground text-xs">
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

              <Separator />
            </>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Konto löschen</p>
              <p className="text-muted-foreground text-xs">
                Ihr Konto und alle zugehörigen Daten werden unwiderruflich
                gelöscht.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive shrink-0 gap-1.5"
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
        open={showAddPasswordDialog}
        onOpenChange={setShowAddPasswordDialog}
        title="Passwort hinzufügen"
        description="Legen Sie ein Passwort fest, um sich auch per E-Mail und Passwort anmelden zu können."
        confirmLabel="Passwort setzen"
        isLoading={isAddingPassword}
        onConfirm={handleAddPassword}
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
          onUserChange?.({ ...saved, twoFactorEnabled: true })
          void invalidateUsersCache()
          emitUserProfileUpdated({
            twoFactorEnabled: true,
            backupCodeCount: nextBackupCodeCount,
          })
          refreshBackupCodeCount()
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
        onDone={() => {
          refreshBackupCodeCount()
        }}
      />

      {hasPassword ? (
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
      ) : (
        <Dialog
          open={showDeleteAccountDialog}
          onOpenChange={setShowDeleteAccountDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Konto löschen</DialogTitle>
              <DialogDescription>
                Möchten Sie Ihr Konto wirklich unwiderruflich löschen? Diese
                Aktion kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setShowDeleteAccountDialog(false)}>
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={() => handleDeleteAccount()}>
                Konto löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <PasskeyManagementDialog
        open={showPasskeyManagementDialog}
        onOpenChangeAction={setShowPasskeyManagementDialog}
        onPasskeyCountChangeAction={(count) => {
          emitUserProfileUpdated({ hasPasskey: count > 0 })
        }}
      />
    </>
  )
}
