import z from 'zod'

import { lecturerSchema } from '@/features/lecturers/schemas/lecturer'
import type {
  CourseLevelPreference as PrismaCourseLevelPreference,
  Lecturer as PrismaLecturer,
  LecturerType as PrismaLecturerType,
} from '@/features/shared/lib/generated/prisma/client'

export type LecturerType = PrismaLecturerType
export type CourseLevelPreference = PrismaCourseLevelPreference
export type Lecturer = PrismaLecturer & {
  assignments?: {
    course: {
      name: string
    }
  }[]
}
export interface LecturerTableMeta {
  createLecturer: (data: z.infer<typeof lecturerSchema>) => void
  updateLecturer: (id: string, data: z.infer<typeof lecturerSchema>) => void
  deleteLecturer: (id: string) => void
  deleteLecturers: (ids: string[]) => void
  refreshLecturers: () => void
}

export interface GetLecturersParams {
  pageIndex: number
  pageSize: number
  sorting?: { id: string; desc: boolean }[]
  columnFilters?: { id: string; value: unknown }[]
  globalFilter?: string
}

export interface GetLecturersResponse {
  data: Lecturer[]
  pageCount: number
  rowCount: number
  facets: {
    type: Record<string, number>
    courseLevelPreference: Record<string, number>
  }
}
