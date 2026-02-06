import type {
  CourseLevelPreference as PrismaCourseLevelPreference,
  Lecturer as PrismaLecturer,
  LecturerType as PrismaLecturerType,
} from '@/features/shared/lib/generated/prisma/client'

export type LecturerType = PrismaLecturerType
export type CourseLevelPreference = PrismaCourseLevelPreference
export type Lecturer = PrismaLecturer

export interface LecturerTableMeta {
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
