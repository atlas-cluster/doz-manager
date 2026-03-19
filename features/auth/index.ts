import { getProfile } from '@/features/auth/actions/get-profile'
import { updateProfile } from '@/features/auth/actions/update-profile'
import { AccountSettings } from '@/features/auth/components/dialogs/account-settings'
import { authClient } from '@/features/auth/lib/client'
import type {
  AccountUser,
  ProfileActionResult,
  PublicAuthSettings,
} from '@/features/auth/types'

export { authClient, AccountSettings, getProfile, updateProfile }
export type { AccountUser, ProfileActionResult, PublicAuthSettings }
