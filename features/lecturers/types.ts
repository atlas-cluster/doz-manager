import type {
  CourseLevelPreference as PrismaCourseLevelPreference,
  Lecturer as PrismaLecturer,
  LecturerType as PrismaLecturerType,
} from '@/features/shared/lib/generated/prisma/client'

export type LecturerType = PrismaLecturerType
export type CourseLevelPreference = PrismaCourseLevelPreference
export type Lecturer = PrismaLecturer
