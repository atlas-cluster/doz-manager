import { deleteLecturers } from './actions/delete-many'
import { lecturerSchema } from './schemas/lecturer.schema'
import z from 'zod'

import type {
  CourseLevelPreference as PrismaCourseLevelPreference,
  Lecturer as PrismaLecturer,
  LecturerType as PrismaLecturerType,
} from '@/features/shared/lib/generated/prisma/client'

export type LecturerType = PrismaLecturerType
export type CourseLevelPreference = PrismaCourseLevelPreference
export type Lecturer = PrismaLecturer
export interface LecturerTableMeta {
  createLecturer: (data: z.infer<typeof lecturerSchema>) => void
  updateLecturer: (id: string, data: z.infer<typeof lecturerSchema>) => void
  deleteLecturer: (id: string) => void
  deleteLecturers: (ids: string[]) => void
  refreshLecturer: () => void
}
