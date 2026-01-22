import { get } from './actions/get'

import { columns } from '@/features/lecturers/components/data-table/columns'
import { DataTable } from '@/features/lecturers/components/data-table/data-table'
import { CreateDialog } from '@/features/lecturers/components/dialog/create'

export {
  DataTable as LecturerDataTable,
  columns as lecturerColumns,
  CreateDialog as CreateLecturerDialog,
  get,
}
