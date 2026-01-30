import { z } from 'zod'

import { courseSchema } from '@/features/courses/schemas/course'
import type {
  Course as PrismaCourse,
  CourseAssignment as PrismaCourseAssignment,
  CourseLevel as PrismaCourseLevel,
  CourseQualification as PrismaCourseQualification,
} from '@/features/shared/lib/generated/prisma/client'

export type Course = PrismaCourse
export type CourseLevel = PrismaCourseLevel
export type CourseAssignment = PrismaCourseAssignment
export type CourseQualification = PrismaCourseQualification

export interface CourseTableMeta {
  createCourse: (data: z.infer<typeof courseSchema>) => void
  updateCourse: (id: string, data: z.infer<typeof courseSchema>) => void
  deleteCourse: (id: string) => void
  deleteCourses: (ids: string[]) => void
  refreshCourse: () => void
}

export interface GetCoursesParams {
  pageIndex: number
  pageSize: number
  sorting?: { id: string; desc: boolean }[]
  columnFilters?: { id: string; value: unknown }[]
  globalFilter?: string
}

export interface GetCoursesResponse {
  data: Course[]
  pageCount: number
  rowCount: number
}
