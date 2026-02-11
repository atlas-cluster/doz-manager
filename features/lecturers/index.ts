import { getLecturers } from '@/features/lecturers/actions/get-lecturers'
import { DataTable } from '@/features/lecturers/components/data-table/data-table'

export { DataTable as LecturerDataTable, getLecturers }
export * from './types'
export * from '@/features/lecturers/actions/create-lecturer-course-assignment'
export * from '@/features/lecturers/actions/delete-lecturer-course-assignment'
