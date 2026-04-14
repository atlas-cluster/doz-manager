'use client'

import { KeyRoundIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { invalidateUsersCache } from '@/features/access-control/actions/invalidate-users-cache'
import { PasskeyRevokeDialog } from '@/features/auth/components/dialogs/passkey-revoke-dialog'
import { authClient } from '@/features/auth/lib/client'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/features/shared/components/ui/empty'
import { Spinner } from '@/features/shared/components/ui/spinner'

type PasskeyManagementDialogProps = {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  currentUserId: string
  onPasskeyCountChangeAction?: (count: number) => void
}

type PasskeyListItem = {
  id: string
  name?: string | null
  createdAt?: string | Date | null
}

export function PasskeyManagementDialog({
  open,
  onOpenChangeAction,
  currentUserId,
  onPasskeyCountChangeAction,
}: PasskeyManagementDialogProps) {
  const [isAddingPasskey, setIsAddingPasskey] = useState(false)
  const [isRevokingPasskey, setIsRevokingPasskey] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [selectedPasskey, setSelectedPasskey] =
    useState<PasskeyListItem | null>(null)

  const {
    data: passkeys,
    isPending: isPasskeysPending,
    refetch: refetchPasskeys,
  } = authClient.useListPasskeys()

  const passkeyItems = (passkeys ?? []) as PasskeyListItem[]

  const getRefetchedPasskeyCount = (result: unknown, fallback: number) => {
    if (
      typeof result === 'object' &&
      result !== null &&
      'data' in result &&
      Array.isArray((result as { data?: unknown }).data)
    ) {
      return (result as { data: unknown[] }).data.length
    }

    return fallback
  }

  const formatPasskeyCreatedAt = (createdAt?: string | Date | null) => {
    if (!createdAt) return null
    const date = createdAt instanceof Date ? createdAt : new Date(createdAt)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('de-DE')
  }

  const handleAddPasskey = async () => {
    if (typeof window === 'undefined' || !('PublicKeyCredential' in window)) {
      toast.error('Passkeys werden von diesem Browser nicht unterstützt.')
      return
    }

    setIsAddingPasskey(true)
    try {
      const { error } = await authClient.passkey.addPasskey({
        name: `Passkey ${new Date().toLocaleDateString('de-DE')}`,
      })

      if (error) {
        toast.error('Passkey konnte nicht hinzugefügt werden.')
        return
      }

      const refetchResult = await refetchPasskeys()
      await invalidateUsersCache(currentUserId)
      onPasskeyCountChangeAction?.(
        getRefetchedPasskeyCount(refetchResult, passkeyItems.length + 1)
      )
      toast.success('Passkey wurde hinzugefügt.')
    } finally {
      setIsAddingPasskey(false)
    }
  }

  const handleOpenRevokeDialog = (passkey: PasskeyListItem) => {
    setSelectedPasskey(passkey)
    setShowRevokeDialog(true)
  }

  const handleRevokePasskey = async () => {
    if (!selectedPasskey) {
      toast.error('Kein Passkey ausgewählt.')
      return
    }

    setIsRevokingPasskey(true)
    let deleted = false
    try {
      const { error } = await authClient.passkey.deletePasskey({
        id: selectedPasskey.id,
      })

      if (error) {
        toast.error('Passkey konnte nicht widerrufen werden.')
        return
      }

      deleted = true

      // Run refetch and cache invalidation in parallel so that a refetch
      // failure cannot prevent the live-update event from being published.
      const [refetchSettled, invalidateSettled] = await Promise.allSettled([
        refetchPasskeys(),
        invalidateUsersCache(currentUserId),
      ])

      if (invalidateSettled.status === 'rejected') {
        console.error(
          'Failed to invalidate users cache after passkey revoke:',
          invalidateSettled.reason
        )
      }

      onPasskeyCountChangeAction?.(
        refetchSettled.status === 'fulfilled'
          ? getRefetchedPasskeyCount(
              refetchSettled.value,
              Math.max(passkeyItems.length - 1, 0)
            )
          : Math.max(passkeyItems.length - 1, 0)
      )
      toast.success('Passkey wurde widerrufen.')
    } finally {
      setIsRevokingPasskey(false)
      if (deleted) {
        setShowRevokeDialog(false)
        setSelectedPasskey(null)
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChangeAction}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Passkeys verwalten</DialogTitle>
            <DialogDescription>
              Sehen Sie alle hinterlegten Passkeys ein und widerrufen Sie diese
              bei Bedarf einzeln.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              {isPasskeysPending
                ? 'Passkeys werden geladen...'
                : `${passkeyItems.length} Passkey${passkeyItems.length === 1 ? '' : 's'} hinterlegt`}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={
                isPasskeysPending || isAddingPasskey || isRevokingPasskey
              }
              onClick={handleAddPasskey}>
              {isAddingPasskey ? (
                <Spinner />
              ) : (
                <KeyRoundIcon className="size-4" />
              )}
              Hinzufügen
            </Button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {!isPasskeysPending && passkeyItems.length === 0 && (
              <Empty className="min-h-48">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <KeyRoundIcon className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>Noch keine Passkeys vorhanden</EmptyTitle>
                  <EmptyDescription>
                    Fügen Sie Ihren ersten Passkey hinzu, um sich künftig
                    schneller anzumelden.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

            {!isPasskeysPending &&
              passkeyItems.map((passkey) => {
                const createdAt = formatPasskeyCreatedAt(passkey.createdAt)
                const passkeyName =
                  passkey.name?.trim() || 'Unbenannter Passkey'
                return (
                  <div
                    key={passkey.id}
                    className="bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{passkeyName}</p>
                      <p className="text-muted-foreground text-xs">
                        {createdAt
                          ? `Hinzugefügt am ${createdAt}`
                          : `ID: ${passkey.id.slice(0, 8)}...`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={isRevokingPasskey}
                      onClick={() => handleOpenRevokeDialog(passkey)}>
                      Widerrufen
                    </Button>
                  </div>
                )
              })}
          </div>
        </DialogContent>
      </Dialog>

      <PasskeyRevokeDialog
        open={showRevokeDialog}
        onOpenChangeAction={setShowRevokeDialog}
        isLoading={isRevokingPasskey}
        passkeyName={selectedPasskey?.name?.trim() || 'Unbenannter Passkey'}
        onConfirmAction={handleRevokePasskey}
      />
    </>
  )
}
