'use client'

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

type EditFieldDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  inputType?: string
  autoComplete?: string
  autoCapitalize?: string
  autoCorrect?: string
  spellCheck?: boolean
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSave: () => void
  isSaving: boolean
}

export function EditFieldDialog({
  open,
  onOpenChange,
  title,
  description,
  inputType = 'text',
  autoComplete,
  autoCapitalize,
  autoCorrect,
  spellCheck,
  placeholder,
  value,
  onChange,
  onSave,
  isSaving,
}: EditFieldDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Input
          type={inputType}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void onSave()
          }}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}>
            Abbrechen
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
