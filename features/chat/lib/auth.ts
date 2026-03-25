/**
 * Extracts and validates the API bearer token from request headers.
 * Optional authentication layer for AI server communication.
 *
 * @param headers - The request headers
 * @returns The bearer token if present, otherwise undefined
 */
export function extractBearerToken(headers: Headers): string | undefined {
  try {
    const authHeader = headers.get('authorization')
    if (!authHeader) return undefined

    const [scheme, token] = authHeader.split(' ')
    if (scheme?.toLowerCase() !== 'bearer') return undefined

    return token?.trim()
  } catch {
    return undefined
  }
}

/**
 * Gets the bearer token for AI server authentication.
 * Priority: Request header token > Environment variable token
 *
 * @param headerToken - Optional bearer token from request headers
 * @returns The bearer token if present, otherwise undefined
 */
export function getBearerToken(headerToken?: string): string | undefined {
  // Use header token if provided, otherwise fall back to environment variable
  return headerToken || process.env.AI_SERVER_BEARER_TOKEN
}

/**
 * Builds request headers for the AI server, including optional bearer token authentication.
 *
 * @param bearerToken - Optional bearer token for authentication
 * @returns Headers object with optional authorization
 */
export function buildAIServerHeaders(
  bearerToken?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`
  }

  return headers
}
