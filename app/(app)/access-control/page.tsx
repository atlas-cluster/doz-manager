import {
  UserDataTable,
  getUsers,
  requireAdmin,
} from '@/features/access-control'

export const dynamic = 'force-dynamic'

export default async function AccessControlPage() {
  const session = await requireAdmin()
  const users = await getUsers()

  return (
    <div>
      <UserDataTable initialData={users} currentUserId={session.user.id} />
    </div>
  )
}
