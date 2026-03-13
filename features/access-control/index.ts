import { getUsers } from '@/features/access-control/actions/get-users'
import { DataTable } from '@/features/access-control/components/data-table/data-table'
import { requireAdmin } from '@/features/access-control/lib/require-admin'

export { DataTable as UserDataTable, getUsers, requireAdmin }
export * from './types'
