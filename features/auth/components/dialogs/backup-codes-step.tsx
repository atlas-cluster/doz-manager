'use client'

import { CheckIcon, ClipboardIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/features/shared/components/ui/button'
import { Card } from '@/features/shared/components/ui/card'
import { Checkbox } from '@/features/shared/components/ui/checkbox'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'

type BackupCodesStepProps = {
  backupCodes: string[]
  onDone: () => void
}

export function BackupCodesStep({ backupCodes, onDone }: BackupCodesStepProps) {
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Backup-Codes speichern</DialogTitle>
        <DialogDescription>
          Speichern Sie diese Codes sicher. Jeder Code kann nur einmal verwendet
          werden.
        </DialogDescription>
      </DialogHeader>
      <Card className={'p-4'}>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((c) => (
            <span
              key={c}
              className="rounded bg-background px-2 py-1 text-center">
              {c}
            </span>
          ))}
        </div>
      </Card>
      <Button variant="outline" className="w-full gap-2" onClick={handleCopy}>
        {copied ? <CheckIcon /> : <ClipboardIcon />}
        {copied ? 'Kopiert!' : 'Alle Codes kopieren'}
      </Button>
      <Card className={'p-0'}>
        <label className="flex items-start gap-3 p-3 text-sm">
          <Checkbox
            checked={confirmed}
            onCheckedChange={() => setConfirmed(!confirmed)}
          />
          <span className={'select-none'}>
            Ich habe meine Backup-Codes an einem sicheren Ort gespeichert und
            verstehe, dass sie nur einmal verwendbar sind.
          </span>
        </label>
      </Card>
      <DialogFooter>
        <Button disabled={!confirmed} onClick={onDone} className="w-full">
          Fertig
        </Button>
      </DialogFooter>
    </>
  )
}
