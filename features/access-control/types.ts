import { z } from 'zod'

import { userSchema } from '@/features/access-control/schemas/user'

export interface AccessControlUser {
  id: string
  name: string
  email: string
  image: string | null
  isAdmin: boolean
  twoFactorEnabled: boolean
  createdAt: Date
  lastLogin: Date | null
  backupCodeCount: number
  authProviders: string[]
}

export interface AccessControlTableMeta {
  currentUserId: string
  createUser: (data: z.infer<typeof userSchema>) => void
  updateUser: (id: string, data: z.infer<typeof userSchema>) => void
  deleteUser: (id: string) => void
  deleteUsers: (ids: string[]) => void
  toggleAdmin: (id: string, isAdmin: boolean) => void
  changePassword: (id: string, newPassword: string) => void
  disable2FA: (id: string) => void
  refreshUsers: () => void
}

export interface GetUsersParams {
  pageIndex: number
  pageSize: number
  sorting?: { id: string; desc: boolean }[]
  columnFilters?: { id: string; value: unknown }[]
  globalFilter?: string
}

export interface GetUsersResponse {
  data: AccessControlUser[]
  pageCount: number
  rowCount: number
  facets: {
    isAdmin: Record<string, number>
  }
}
