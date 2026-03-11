import { BACKUP_CODE_PART_LENGTH } from '@/features/auth/lib/backup-code-generate'

const BACKUP_CODE_PREFIX = 'PRVD'
const BACKUP_CODE_BODY_LENGTH = BACKUP_CODE_PART_LENGTH * 2

function getBackupCodeBody(raw: string): string | null {
  const normalized = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
  if (!normalized) return null

  const withoutPrefix = normalized.startsWith(BACKUP_CODE_PREFIX)
    ? normalized.slice(BACKUP_CODE_PREFIX.length)
    : normalized

  if (withoutPrefix.length !== BACKUP_CODE_BODY_LENGTH) {
    return null
  }

  return withoutPrefix
}

export function toCanonicalBackupCode(raw: string): string | null {
  const body = getBackupCodeBody(raw)
  if (!body) return null

  return `${BACKUP_CODE_PREFIX}-${body.slice(0, BACKUP_CODE_PART_LENGTH)}-${body.slice(BACKUP_CODE_PART_LENGTH)}`
}

export function formatBackupCode(raw: string): string {
  return toCanonicalBackupCode(raw) ?? raw.trim().toUpperCase()
}

export function formatBackupCodes(raw: string[]): string[] {
  return raw.map(formatBackupCode)
}
