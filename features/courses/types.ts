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
