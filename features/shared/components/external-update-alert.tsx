import { AlertTriangle, RotateCcw } from 'lucide-react'

import { Button } from '@/features/shared/components/ui/button'
import { Alert, AlertDescription } from '@/features/shared/components/ui/alert'

type ExternalUpdateAlertProps = {
  onReload: () => Promise<unknown> | unknown
}

export function ExternalUpdateAlert({ onReload }: ExternalUpdateAlertProps) {
  return (
    <Alert className="border-amber-200/70 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <div className={'col-span-2 flex items-center justify-between gap-4'}>
        <div className={'flex gap-2'}>
          <AlertTriangle className="mt-1 size-4 shrink-0 text-amber-900 dark:text-amber-50" />
          <AlertDescription className="text-amber-900 dark:text-amber-50">
            <p>
              Dieser Datensatz wurde während der Bearbeitung geändert. Laden Sie
              bitte die neuesten Daten, bevor Sie speichern.
            </p>
          </AlertDescription>
        </div>
        <Button type="button" size="icon" variant="outline" onClick={onReload}>
          <RotateCcw />
        </Button>
      </div>
    </Alert>
  )
}
