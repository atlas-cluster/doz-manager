'use client'
import { CheckIcon, ClipboardIcon } from 'lucide-react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

import { BackupCodesStep } from '@/features/auth/components/dialogs/backup-codes-step'
import { Button } from '@/features/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import { Input } from '@/features/shared/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/features/shared/components/ui/input-otp'

type SetupStep = 'setup' | 'backup'

type TwoFactorSetupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  totpUri: string
  backupCodes: string[]
  onVerify: (code: string) => Promise<boolean>
  onDone: () => void
  isVerifying: boolean
}

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  totpUri,
  backupCodes,
  onVerify,
  onDone,
  isVerifying,
}: TwoFactorSetupDialogProps) {
  const [step, setStep] = useState<SetupStep>('setup')
  const [code, setCode] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [uriCopied, setUriCopied] = useState(false)

  useEffect(() => {
    if (!totpUri) return
    QRCode.toDataURL(totpUri, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [totpUri])

  const handleComplete = async (val: string) => {
    const ok = await onVerify(val)
    if (ok) {
      setStep('backup')
    } else {
      setCode('')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isVerifying) {
          if (!v) {
            setStep('setup')
            setCode('')
          }
          onOpenChange(v)
        }
      }}>
      <DialogContent forceMount className="sm:max-w-md">
        {step === 'setup' && (
          <>
            <DialogHeader>
              <DialogTitle>Authenticator einrichten</DialogTitle>
              <DialogDescription>
                Scannen Sie den QR-Code mit Ihrer Authenticator-App und geben
                Sie dann den 6-stelligen Code ein.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt="TOTP QR Code"
                  className="rounded-lg border"
                  width={200}
                  height={200}
                  unoptimized
                />
              ) : (
                <div className="bg-muted size-50 animate-pulse rounded-lg border" />
              )}
              <div className="w-full space-y-1.5">
                <p className="text-muted-foreground text-xs">
                  Oder URI manuell eingeben:
                </p>
                <div className="flex gap-2">
                  <Input
                    value={totpUri}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(totpUri)
                      setUriCopied(true)
                      setTimeout(() => setUriCopied(false), 2000)
                    }}>
                    {uriCopied ? <CheckIcon /> : <ClipboardIcon />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Bestätigungscode</p>
                <p className="text-muted-foreground text-xs">
                  Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App
                  ein.
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(val) => setCode(val.replace(/\D/g, ''))}
                  disabled={isVerifying}
                  autoFocus
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
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                disabled={code.length !== 6 || isVerifying}
                onClick={() => void handleComplete(code)}>
                2FA aktivieren
              </Button>
            </DialogFooter>
          </>
        )}
        {step === 'backup' && (
          <BackupCodesStep backupCodes={backupCodes} onDone={onDone} />
        )}
      </DialogContent>
    </Dialog>
  )
}
