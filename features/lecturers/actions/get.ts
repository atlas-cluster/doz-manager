'use server'

import {
  CourseLevelPreference,
  GetLecturersParams,
  GetLecturersResponse,
  LecturerType,
} from '@/features/lecturers/types'
import { Prisma } from '@/features/shared/lib/generated/prisma/client'
import { prisma } from '@/features/shared/lib/prisma'

export async function getLecturers(
  {
    pageIndex = 0,
    pageSize = 10,
    sorting = [],
    columnFilters = [],
    globalFilter = '',
  }: GetLecturersParams = {
    pageIndex: 0,
    pageSize: 10,
  }
): Promise<GetLecturersResponse> {
  const globalConditions: Prisma.LecturerWhereInput[] = []
  const typeConditions: Prisma.LecturerWhereInput[] = []
  const prefConditions: Prisma.LecturerWhereInput[] = []

  if (globalFilter) {
    globalConditions.push({
      OR: [
        { firstName: { contains: globalFilter } },
        { secondName: { contains: globalFilter } },
        { lastName: { contains: globalFilter } },
        { email: { contains: globalFilter } },
        { phone: { contains: globalFilter } },
      ],
    })
  }

  for (const filter of columnFilters) {
    if (filter.id === 'type' && Array.isArray(filter.value)) {
      typeConditions.push({ type: { in: filter.value as LecturerType[] } })
    }

    if (filter.id === 'courseLevelPreference' && Array.isArray(filter.value)) {
      prefConditions.push({
        courseLevelPreference: { in: filter.value as CourseLevelPreference[] },
      })
    }
  }

  const whereMain: Prisma.LecturerWhereInput =
    [...globalConditions, ...typeConditions, ...prefConditions].length > 0
      ? { AND: [...globalConditions, ...typeConditions, ...prefConditions] }
      : {}

  const whereType: Prisma.LecturerWhereInput =
    [...globalConditions, ...prefConditions].length > 0
      ? { AND: [...globalConditions, ...prefConditions] }
      : {}

  const wherePref: Prisma.LecturerWhereInput =
    [...globalConditions, ...typeConditions].length > 0
      ? { AND: [...globalConditions, ...typeConditions] }
      : {}

  const orderBy: Prisma.LecturerOrderByWithRelationInput[] =
    sorting.length > 0
      ? sorting.map((sort) => {
          if (sort.id === 'name') {
            return { lastName: sort.desc ? 'desc' : 'asc' }
          }
          return { [sort.id]: sort.desc ? 'desc' : 'asc' }
        })
      : [{ lastName: 'asc' }]

  const [count, data, typeFacets, prefFacets] = await prisma.$transaction([
    prisma.lecturer.count({ where: whereMain }),
    prisma.lecturer.findMany({
      where: whereMain,
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.lecturer.groupBy({
      by: ['type'],
      where: whereType,
      _count: { type: true },
      orderBy: {
        type: 'asc',
      },
    }),
    prisma.lecturer.groupBy({
      by: ['courseLevelPreference'],
      where: wherePref,
      _count: { courseLevelPreference: true },
      orderBy: {
        courseLevelPreference: 'asc',
      },
    }),
  ])

  return {
    data,
    pageCount: Math.ceil(count / pageSize),
    rowCount: count,
    facets: {
      type: Object.fromEntries(
        typeFacets.map((f) => [
          f.type,
          (f._count as { type: number }).type ?? 0,
        ])
      ),
      courseLevelPreference: Object.fromEntries(
        prefFacets.map((f) => [
          f.courseLevelPreference,
          (f._count as { courseLevelPreference: number })
            .courseLevelPreference ?? 0,
        ])
      ),
    },
  }
}
