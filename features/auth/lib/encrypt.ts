import { symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto'

function getKey(): string {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('Missing BETTER_AUTH_SECRET or AUTH_SECRET')
  }
  return secret
}

/**
 * Encrypt a plaintext string using Better Auth's built-in
 * symmetric encryption (XChaCha20-Poly1305), keyed by BETTER_AUTH_SECRET.
 */
export async function encrypt(plaintext: string): Promise<string> {
  return symmetricEncrypt({ key: getKey(), data: plaintext })
}

/**
 * Decrypt a string that was encrypted with `encrypt`.
 */
export async function decrypt(ciphertext: string): Promise<string> {
  return symmetricDecrypt({ key: getKey(), data: ciphertext })
}
