import { z } from 'zod'

import { courseSchema } from '@/features/courses/schemas/course.schema'
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
