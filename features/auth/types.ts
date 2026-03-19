export type AccountUser = {
  id: string
  name: string
  email: string
  image: string | null
  twoFactorEnabled: boolean
}

export type ProfileActionResult = {
  user?: {
    id: string
    name: string
    email: string
    image: string | null
    twoFactorEnabled: boolean
  }
  error?: string
}

/** Full auth settings (admin-only, includes masked secrets) */
export type AuthSettingsData = {
  passwordEnabled: boolean
  passkeyEnabled: boolean

  microsoftEnabled: boolean
  microsoftClientId: string
  microsoftTenantId: string
  microsoftHasSecret: boolean

  githubEnabled: boolean
  githubClientId: string
  githubHasSecret: boolean

  oauthEnabled: boolean
  oauthClientId: string
  oauthIssuerUrl: string
  oauthHasSecret: boolean
}

/** Public flags only — safe to send to login page */
export type PublicAuthSettings = {
  passwordEnabled: boolean
  passkeyEnabled: boolean
  microsoftEnabled: boolean
  githubEnabled: boolean
  oauthEnabled: boolean
}

/** User counts per provider */
export type ProviderUserCounts = {
  password: number
  passkey: number
  microsoft: number
  github: number
  oauth: number
}
