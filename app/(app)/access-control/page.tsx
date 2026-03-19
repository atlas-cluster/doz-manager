import {
  UserDataTable,
  getUsers,
  requireAdmin,
} from '@/features/access-control'
import { getPublicAuthSettings } from '@/features/auth/actions/get-public-auth-settings'

export const dynamic = 'force-dynamic'

export default async function AccessControlPage() {
  const session = await requireAdmin()
  const [users, enabledMethods] = await Promise.all([
    getUsers(),
    getPublicAuthSettings(),
  ])

  return (
    <div>
      <UserDataTable
        initialData={users}
        currentUserId={session.user.id}
        enabledMethods={enabledMethods}
      />
    </div>
  )
}
