'use server'

import {
  GetLecturersParams,
  GetLecturersResponse,
} from '@/features/lecturers/types'
import { Prisma } from '@/features/shared/lib/generated/prisma/client'
import { prisma } from '@/features/shared/lib/prisma'

export async function getLecturers(
  params: GetLecturersParams = {
    pageIndex: 0,
    pageSize: 10,
  }
): Promise<GetLecturersResponse> {
  const { pageIndex, pageSize, sorting, columnFilters, globalFilter } = params

  const buildWhere = (ignoreFilterId?: string) => {
    const where: Prisma.LecturerWhereInput = {
      AND: [],
    }

    if (globalFilter) {
      ;(where.AND as Prisma.LecturerWhereInput[]).push({
        OR: [
          { firstName: { contains: globalFilter } },
          { secondName: { contains: globalFilter } },
          { lastName: { contains: globalFilter } },
          { email: { contains: globalFilter } },
          { phone: { contains: globalFilter } },
        ],
      })
    }

    if (columnFilters) {
      for (const filter of columnFilters) {
        if (filter.id === ignoreFilterId) continue

        if (
          filter.id === 'type' &&
          Array.isArray(filter.value) &&
          filter.value.length > 0
        ) {
          ;(where.AND as Prisma.LecturerWhereInput[]).push({
            type: { in: filter.value },
          })
        }

        if (
          filter.id === 'courseLevelPreference' &&
          Array.isArray(filter.value) &&
          filter.value.length > 0
        ) {
          const wantsBachelor = filter.value.includes('bachelor')
          const wantsMaster = filter.value.includes('master')

          if (wantsBachelor && wantsMaster) {
            ;(where.AND as Prisma.LecturerWhereInput[]).push({
              courseLevelPreference: 'both',
            })
          } else if (wantsBachelor) {
            ;(where.AND as Prisma.LecturerWhereInput[]).push({
              courseLevelPreference: { in: ['bachelor', 'both'] },
            })
          } else if (wantsMaster) {
            ;(where.AND as Prisma.LecturerWhereInput[]).push({
              courseLevelPreference: { in: ['master', 'both'] },
            })
          }
        }
      }
    }
    return where
  }

  const where = buildWhere()

  const orderBy: Prisma.LecturerOrderByWithRelationInput[] = []
  if (sorting && sorting.length > 0) {
    for (const sort of sorting) {
      if (sort.id === 'name') {
        orderBy.push({ lastName: sort.desc ? 'desc' : 'asc' })
      } else {
        if (
          ['email', 'phone', 'type', 'courseLevelPreference'].includes(sort.id)
        ) {
          orderBy.push({ [sort.id]: sort.desc ? 'desc' : 'asc' })
        }
      }
    }
  } else {
    orderBy.push({ lastName: 'asc' })
  }

  const [count, data, typeFacets, prefFacets] = await prisma.$transaction([
    prisma.lecturer.count({ where }),
    prisma.lecturer.findMany({
      where,
      skip: pageIndex * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.lecturer.groupBy({
      by: ['type'],
      where: buildWhere('type'),
      _count: {
        type: true,
      },
      orderBy: {
        type: 'asc',
      },
    }),
    prisma.lecturer.groupBy({
      by: ['courseLevelPreference'],
      where: buildWhere('courseLevelPreference'),
      _count: {
        courseLevelPreference: true,
      },
      orderBy: {
        courseLevelPreference: 'asc',
      },
    }),
  ])

  const typeFacetRecord: Record<string, number> = {}
  typeFacets.forEach((f) => {
    if (f._count) {
      typeFacetRecord[f.type] = (f._count as { type: number }).type
    }
  })

  const prefFacetRecord: Record<string, number> = {}
  prefFacets.forEach((f) => {
    if (f._count) {
      prefFacetRecord[f.courseLevelPreference] = (
        f._count as { courseLevelPreference: number }
      ).courseLevelPreference
    }
  })

  return {
    data,
    pageCount: Math.ceil(count / pageSize),
    rowCount: count,
    facets: {
      type: typeFacetRecord,
      courseLevelPreference: prefFacetRecord,
    },
  }
}
