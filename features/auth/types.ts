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
