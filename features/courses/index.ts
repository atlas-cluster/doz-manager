import { getCourses } from '@/features/courses/actions/get'
import { columns } from '@/features/courses/components/data-table/columns'
import { DataTable } from '@/features/courses/components/data-table/data-table'

export { DataTable as CourseDataTable, columns as courseColumns, getCourses }
