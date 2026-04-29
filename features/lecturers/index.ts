import { getLecturers } from '@/features/lecturers/actions/get-lecturers'
import { DataTable } from '@/features/lecturers/components/data-table/data-table'
import { qualificationSchema } from '@/features/lecturers/schemas/qualification'

export { DataTable as LecturerDataTable, getLecturers, qualificationSchema }
export * from './types'
