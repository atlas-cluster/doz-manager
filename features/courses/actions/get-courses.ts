'use server'

import { unstable_cache } from 'next/cache'

import {
  CourseLevel,
  GetCoursesParams,
  GetCoursesResponse,
} from '@/features/courses/types'
import {
  CourseLevel as CourseLevelEnum,
  Prisma,
} from '@/features/shared/lib/generated/prisma/client'
import { prisma } from '@/features/shared/lib/prisma'

async function getCoursesInternal({
  pageIndex = 0,
  pageSize = 10,
  sorting = [],
  columnFilters = [],
  globalFilter = '',
}: GetCoursesParams): Promise<GetCoursesResponse> {
  const globalConditions: Prisma.CourseWhereInput[] = []
  const isOpenConditions: Prisma.CourseWhereInput[] = []
  const courseLevelConditions: Prisma.CourseWhereInput[] = []

  if (globalFilter) {
    globalConditions.push({
      OR: [{ name: { contains: globalFilter } }],
    })
  }

  for (const filter of columnFilters) {
    if (filter.id === 'isOpen' && Array.isArray(filter.value)) {
      const boolValues = (filter.value as string[]).map((v) => v === 'true')
      isOpenConditions.push({
        OR: boolValues.map((v) => ({ isOpen: v })),
      })
    }

    if (filter.id === 'courseLevel' && Array.isArray(filter.value)) {
      const validLevels = Object.values(CourseLevelEnum) as CourseLevel[]
      const levels = (filter.value as string[]).filter((v): v is CourseLevel =>
        validLevels.includes(v as CourseLevel)
      )
      if (levels.length > 0) {
        courseLevelConditions.push({
          courseLevel: { in: levels },
        })
      }
    }
  }

  const whereMain: Prisma.CourseWhereInput =
    globalConditions.length +
      isOpenConditions.length +
      courseLevelConditions.length >
    0
      ? {
          AND: [
            ...globalConditions,
            ...isOpenConditions,
            ...courseLevelConditions,
          ],
        }
      : {}

  const whereIsOpen: Prisma.CourseWhereInput =
    globalConditions.length + courseLevelConditions.length > 0
      ? { AND: [...globalConditions, ...courseLevelConditions] }
      : {}

  const whereCourseLevel: Prisma.CourseWhereInput =
    globalConditions.length + isOpenConditions.length > 0
      ? { AND: [...globalConditions, ...isOpenConditions] }
      : {}

  const orderBy: Prisma.CourseOrderByWithRelationInput[] =
    sorting.length > 0
      ? sorting.map((sort) => {
          if (sort.id === 'name') {
            return { name: sort.desc ? 'desc' : 'asc' }
          }
          return { [sort.id]: sort.desc ? 'desc' : 'asc' }
        })
      : [{ name: 'asc' }]

  const [count, data, isOpenFacets, courseLevelFacets] =
    await prisma.$transaction([
      prisma.course.count({ where: whereMain }),
      prisma.course.findMany({
        where: whereMain,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy,
        include: {
          assignments: {
            select: {
              lecturer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.course.groupBy({
        by: ['isOpen'],
        where: whereIsOpen,
        _count: { isOpen: true },
        orderBy: {
          isOpen: 'asc',
        },
      }),
      prisma.course.groupBy({
        by: ['courseLevel'],
        where: whereCourseLevel,
        _count: { courseLevel: true },
        orderBy: {
          courseLevel: 'asc',
        },
      }),
    ])

  return {
    data,
    pageCount: Math.ceil(count / pageSize),
    rowCount: count,
    facets: {
      isOpen: Object.fromEntries(
        isOpenFacets.map((f) => [
          String(f.isOpen),
          (f._count as { isOpen: number }).isOpen ?? 0,
        ])
      ),
      courseLevel: Object.fromEntries(
        courseLevelFacets.map((f) => [
          f.courseLevel,
          (f._count as { courseLevel: number }).courseLevel ?? 0,
        ])
      ),
    },
  }
}

export async function getCourses(
  params: GetCoursesParams = {
    pageIndex: 0,
    pageSize: 10,
  }
) {
  return unstable_cache(
    async () => getCoursesInternal(params),
    ['courses-get', JSON.stringify(params)],
    {
      tags: ['courses'],
      revalidate: 3600,
    }
  )()
}
