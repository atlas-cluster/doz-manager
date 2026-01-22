import { getLecturers } from '@/features/lecturers/actions/get'
import { columns } from '@/features/lecturers/components/data-table/columns'
import { DataTable } from '@/features/lecturers/components/data-table/data-table'

export {
  DataTable as LecturerDataTable,
  columns as lecturerColumns,
  getLecturers,
}
