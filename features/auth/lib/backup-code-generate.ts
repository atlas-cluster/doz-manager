const BACKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const BACKUP_CODE_AMOUNT = 10
export const BACKUP_CODE_PART_LENGTH = 4

function createBackupCode(): string {
  const randomBytes = new Uint8Array(BACKUP_CODE_PART_LENGTH * 2)
  globalThis.crypto.getRandomValues(randomBytes)

  let body = ''
  for (const byte of randomBytes) {
    body += BACKUP_CODE_ALPHABET[byte % BACKUP_CODE_ALPHABET.length]
  }

  return `PRVD-${body.slice(0, BACKUP_CODE_PART_LENGTH)}-${body.slice(BACKUP_CODE_PART_LENGTH)}`
}

export function generateBackupCodes(): string[] {
  return Array.from({ length: BACKUP_CODE_AMOUNT }, createBackupCode)
}
